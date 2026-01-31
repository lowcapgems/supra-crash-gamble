/// Moon Dog Crash Game - Supra dVRF Consumer Contract
/// 
/// REQUIREMENTS:
/// - Min bet: 1 SUPRA
/// - Max bet: 100,000 SUPRA  
/// - 10 seconds between rounds (controlled by backend)
/// - All losses go to treasury address
///
/// DEPLOYMENT STEPS:
/// 1. Deploy this contract to Supra network
/// 2. Register with Supra dVRF dashboard
/// 3. Add contract as consumer
/// 4. Fund VRF subscription
/// 5. Call initialize() with treasury address
/// 6. Start the game!

module moon_dog::crash_game {
    use std::signer;
    use std::vector;
    use std::error;
    use aptos_std::table::{Self, Table};
    use aptos_std::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::account;
    
    // Supra Framework imports
    use supra_framework::supra_coin::SupraCoin;
    use supra_framework::vrf_v2_consumer;

    // ============== Error Codes ==============
    
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_GAME_PAUSED: u64 = 2;
    const E_ROUND_NOT_IN_BETTING_PHASE: u64 = 3;
    const E_ROUND_NOT_RUNNING: u64 = 4;
    const E_INSUFFICIENT_BET: u64 = 5;
    const E_BET_TOO_LARGE: u64 = 6;
    const E_NO_BET_FOUND: u64 = 7;
    const E_ALREADY_CASHED_OUT: u64 = 8;
    const E_ROUND_CRASHED: u64 = 9;
    const E_ALREADY_BET: u64 = 10;
    const E_WAITING_FOR_VRF: u64 = 11;
    const E_INSUFFICIENT_POOL: u64 = 12;
    const E_ROUND_ALREADY_EXISTS: u64 = 13;
    const E_INVALID_TREASURY: u64 = 14;

    // ============== Constants ==============
    
    /// Minimum bet: 1 SUPRA (in octas, 1 SUPRA = 10^8 octas)
    const MIN_BET: u64 = 100_000_000;  // 1 SUPRA
    
    /// Maximum bet: 100,000 SUPRA
    const MAX_BET: u64 = 10_000_000_000_000;  // 100,000 SUPRA
    
    /// House edge: 3% (300 basis points)
    const HOUSE_EDGE_BPS: u64 = 300;
    const BPS_DENOMINATOR: u64 = 10000;
    
    /// Multiplier precision (100 = 1.00x)
    const PRECISION: u64 = 100;
    
    /// Growth rate per second in basis points (1500 = 15% per second)
    /// This means: 1.00x at 0s, ~1.15x at 1s, ~1.32x at 2s, etc.
    const GROWTH_RATE_BPS: u64 = 1500;

    // Round status constants
    const STATUS_BETTING: u8 = 0;
    const STATUS_WAITING_VRF: u8 = 1;
    const STATUS_RUNNING: u8 = 2;
    const STATUS_CRASHED: u8 = 3;

    // ============== Resources ==============

    /// Main game state - stored at the contract deployer's address
    struct GameState has key {
        admin: address,
        treasury: address,              // Treasury wallet receives all losses
        current_round_id: u64,
        total_rounds: u64,
        total_volume: u64,              // Total SUPRA wagered all time
        total_house_profit: u64,        // Total profit sent to treasury
        paused: bool,
        house_pool: Coin<SupraCoin>,    // Liquidity for payouts
        vrf_subscription_id: u64,
    }

    /// Current round data
    struct CurrentRound has key {
        round_id: u64,
        status: u8,
        start_time: u64,
        crash_point: u64,               // Hidden until crash (in PRECISION, e.g., 250 = 2.50x)
        total_bets: u64,
        total_payouts: u64,
        player_count: u64,
        bet_escrow: Coin<SupraCoin>,    // Locked bets for this round
        vrf_request_nonce: u64,
    }

    /// All bets for current round
    struct RoundBets has key {
        bets: Table<address, PlayerBet>,
        players: vector<address>,
    }

    /// Individual player bet
    struct PlayerBet has store, drop, copy {
        amount: u64,
        cashed_out: bool,
        cash_out_multiplier: u64,       // In PRECISION (e.g., 150 = 1.50x)
        payout: u64,
    }

    // ============== Events ==============

    struct GameEvents has key {
        round_started: EventHandle<RoundStartedEvent>,
        bet_placed: EventHandle<BetPlacedEvent>,
        cash_out: EventHandle<CashOutEvent>,
        round_crashed: EventHandle<RoundCrashedEvent>,
        treasury_withdrawal: EventHandle<TreasuryWithdrawalEvent>,
    }

    struct RoundStartedEvent has drop, store {
        round_id: u64,
        start_time: u64,
        player_count: u64,
        total_bets: u64,
    }

    struct BetPlacedEvent has drop, store {
        round_id: u64,
        player: address,
        amount: u64,
        total_bets: u64,
    }

    struct CashOutEvent has drop, store {
        round_id: u64,
        player: address,
        multiplier: u64,
        bet_amount: u64,
        payout: u64,
        profit: u64,
    }

    struct RoundCrashedEvent has drop, store {
        round_id: u64,
        crash_point: u64,
        total_bets: u64,
        total_payouts: u64,
        house_profit: u64,
        players_lost: u64,
    }

    struct TreasuryWithdrawalEvent has drop, store {
        amount: u64,
        treasury: address,
        timestamp: u64,
    }

    // ============== Initialization ==============

    /// Initialize the game - call once after deployment
    /// 
    /// @param admin - Contract deployer (will be admin)
    /// @param treasury - Address to receive all losses
    /// @param vrf_subscription_id - Supra VRF subscription ID
    /// @param initial_pool - Initial liquidity for house pool
    public entry fun initialize(
        admin: &signer,
        treasury: address,
        vrf_subscription_id: u64,
        initial_pool: u64,
    ) {
        let admin_addr = signer::address_of(admin);
        
        // Validate treasury is not zero address
        assert!(treasury != @0x0, error::invalid_argument(E_INVALID_TREASURY));
        
        // Create game state
        let game_state = GameState {
            admin: admin_addr,
            treasury,
            current_round_id: 0,
            total_rounds: 0,
            total_volume: 0,
            total_house_profit: 0,
            paused: false,
            house_pool: coin::withdraw<SupraCoin>(admin, initial_pool),
            vrf_subscription_id,
        };
        move_to(admin, game_state);
        
        // Create events
        let events = GameEvents {
            round_started: account::new_event_handle<RoundStartedEvent>(admin),
            bet_placed: account::new_event_handle<BetPlacedEvent>(admin),
            cash_out: account::new_event_handle<CashOutEvent>(admin),
            round_crashed: account::new_event_handle<RoundCrashedEvent>(admin),
            treasury_withdrawal: account::new_event_handle<TreasuryWithdrawalEvent>(admin),
        };
        move_to(admin, events);
    }

    // ============== Admin Functions ==============

    /// Start a new betting round
    /// Backend should call this after 10 second waiting period
    public entry fun start_betting_round(
        admin: &signer
    ) acquires GameState, CurrentRound, RoundBets {
        let admin_addr = signer::address_of(admin);
        let game = borrow_global_mut<GameState>(admin_addr);
        
        assert!(admin_addr == game.admin, error::permission_denied(E_NOT_AUTHORIZED));
        assert!(!game.paused, error::invalid_state(E_GAME_PAUSED));
        
        // Clean up previous round if exists
        if (exists<CurrentRound>(admin_addr)) {
            let CurrentRound { 
                round_id: _, 
                status: _, 
                start_time: _, 
                crash_point: _, 
                total_bets: _, 
                total_payouts: _, 
                player_count: _,
                bet_escrow,
                vrf_request_nonce: _,
            } = move_from<CurrentRound>(admin_addr);
            
            // Any remaining escrow goes to house pool
            coin::merge(&mut game.house_pool, bet_escrow);
        };
        
        if (exists<RoundBets>(admin_addr)) {
            let RoundBets { bets, players: _ } = move_from<RoundBets>(admin_addr);
            table::destroy_empty(bets);
        };
        
        game.current_round_id = game.current_round_id + 1;
        
        // Create new round
        let round = CurrentRound {
            round_id: game.current_round_id,
            status: STATUS_BETTING,
            start_time: 0,
            crash_point: 0,
            total_bets: 0,
            total_payouts: 0,
            player_count: 0,
            bet_escrow: coin::zero<SupraCoin>(),
            vrf_request_nonce: 0,
        };
        move_to(admin, round);
        
        // Create bets storage
        let bets = RoundBets {
            bets: table::new(),
            players: vector::empty(),
        };
        move_to(admin, bets);
    }

    /// Close betting and request VRF randomness
    /// Backend calls this after betting period ends (e.g., 5 seconds)
    public entry fun close_betting_and_request_vrf(
        admin: &signer
    ) acquires GameState, CurrentRound {
        let admin_addr = signer::address_of(admin);
        let game = borrow_global<GameState>(admin_addr);
        
        assert!(admin_addr == game.admin, error::permission_denied(E_NOT_AUTHORIZED));
        
        let round = borrow_global_mut<CurrentRound>(admin_addr);
        assert!(round.status == STATUS_BETTING, error::invalid_state(E_ROUND_NOT_IN_BETTING_PHASE));
        
        // Change status to waiting for VRF
        round.status = STATUS_WAITING_VRF;
        
        // Request randomness from Supra dVRF
        let nonce = vrf_v2_consumer::request_randomness(
            admin,
            game.vrf_subscription_id,
            1,  // num_words: we need 1 random number
            1,  // num_confirmations: blocks to wait
        );
        
        round.vrf_request_nonce = nonce;
    }

    /// dVRF CALLBACK - Called by Supra VRF oracle
    /// DO NOT call manually - only Supra oracle can call this
    public entry fun fulfill_randomness(
        nonce: u64,
        random_words: vector<u64>,
    ) acquires CurrentRound, RoundBets, GameEvents {
        let admin_addr = @moon_dog;
        let round = borrow_global_mut<CurrentRound>(admin_addr);
        
        // Verify request
        assert!(round.status == STATUS_WAITING_VRF, error::invalid_state(E_WAITING_FOR_VRF));
        assert!(round.vrf_request_nonce == nonce, error::invalid_argument(E_NOT_AUTHORIZED));
        
        // Get random number and calculate crash point
        let random_value = *vector::borrow(&random_words, 0);
        let crash_point = calculate_crash_point(random_value);
        
        // Start the round
        round.crash_point = crash_point;
        round.status = STATUS_RUNNING;
        round.start_time = timestamp::now_seconds();
        
        // Emit event
        let round_bets = borrow_global<RoundBets>(admin_addr);
        let events = borrow_global_mut<GameEvents>(admin_addr);
        event::emit_event(&mut events.round_started, RoundStartedEvent {
            round_id: round.round_id,
            start_time: round.start_time,
            player_count: vector::length(&round_bets.players),
            total_bets: round.total_bets,
        });
    }

    /// End the round and settle all bets
    /// Losses are sent directly to treasury
    public entry fun end_round(
        admin: &signer
    ) acquires GameState, CurrentRound, RoundBets, GameEvents {
        let admin_addr = signer::address_of(admin);
        let game = borrow_global_mut<GameState>(admin_addr);
        
        assert!(admin_addr == game.admin, error::permission_denied(E_NOT_AUTHORIZED));
        
        let round = borrow_global_mut<CurrentRound>(admin_addr);
        assert!(round.status == STATUS_RUNNING, error::invalid_state(E_ROUND_NOT_RUNNING));
        
        // Verify crash should happen
        let current_mult = calculate_multiplier(round.start_time);
        assert!(current_mult >= round.crash_point, error::invalid_state(E_ROUND_NOT_RUNNING));
        
        round.status = STATUS_CRASHED;
        
        // Calculate stats
        let remaining_escrow = coin::value(&round.bet_escrow);
        let house_profit = remaining_escrow;
        
        // Count players who lost
        let round_bets = borrow_global<RoundBets>(admin_addr);
        let players_lost = 0u64;
        let i = 0;
        let len = vector::length(&round_bets.players);
        while (i < len) {
            let player_addr = *vector::borrow(&round_bets.players, i);
            let bet = table::borrow(&round_bets.bets, player_addr);
            if (!bet.cashed_out) {
                players_lost = players_lost + 1;
            };
            i = i + 1;
        };
        
        // Send remaining escrow (losses) to treasury
        if (remaining_escrow > 0) {
            let loss_coins = coin::extract_all(&mut round.bet_escrow);
            coin::deposit(game.treasury, loss_coins);
        };
        
        // Update game stats
        game.total_rounds = game.total_rounds + 1;
        game.total_house_profit = game.total_house_profit + house_profit;
        
        // Emit event
        let events = borrow_global_mut<GameEvents>(admin_addr);
        event::emit_event(&mut events.round_crashed, RoundCrashedEvent {
            round_id: round.round_id,
            crash_point: round.crash_point,
            total_bets: round.total_bets,
            total_payouts: round.total_payouts,
            house_profit,
            players_lost,
        });
    }

    /// Pause/unpause the game (emergency)
    public entry fun set_paused(
        admin: &signer, 
        paused: bool
    ) acquires GameState {
        let admin_addr = signer::address_of(admin);
        let game = borrow_global_mut<GameState>(admin_addr);
        assert!(admin_addr == game.admin, error::permission_denied(E_NOT_AUTHORIZED));
        game.paused = paused;
    }

    /// Update treasury address
    public entry fun set_treasury(
        admin: &signer,
        new_treasury: address,
    ) acquires GameState {
        let admin_addr = signer::address_of(admin);
        let game = borrow_global_mut<GameState>(admin_addr);
        assert!(admin_addr == game.admin, error::permission_denied(E_NOT_AUTHORIZED));
        assert!(new_treasury != @0x0, error::invalid_argument(E_INVALID_TREASURY));
        game.treasury = new_treasury;
    }

    /// Add liquidity to house pool
    public entry fun add_liquidity(
        admin: &signer,
        amount: u64,
    ) acquires GameState {
        let admin_addr = signer::address_of(admin);
        let game = borrow_global_mut<GameState>(admin_addr);
        assert!(admin_addr == game.admin, error::permission_denied(E_NOT_AUTHORIZED));
        
        let coins = coin::withdraw<SupraCoin>(admin, amount);
        coin::merge(&mut game.house_pool, coins);
    }

    /// Withdraw from house pool to treasury
    public entry fun withdraw_to_treasury(
        admin: &signer,
        amount: u64,
    ) acquires GameState, GameEvents {
        let admin_addr = signer::address_of(admin);
        let game = borrow_global_mut<GameState>(admin_addr);
        
        assert!(admin_addr == game.admin, error::permission_denied(E_NOT_AUTHORIZED));
        
        let pool_balance = coin::value(&game.house_pool);
        assert!(pool_balance >= amount, error::invalid_argument(E_INSUFFICIENT_POOL));
        
        let withdraw_coins = coin::extract(&mut game.house_pool, amount);
        coin::deposit(game.treasury, withdraw_coins);
        
        // Emit event
        let events = borrow_global_mut<GameEvents>(admin_addr);
        event::emit_event(&mut events.treasury_withdrawal, TreasuryWithdrawalEvent {
            amount,
            treasury: game.treasury,
            timestamp: timestamp::now_seconds(),
        });
    }

    // ============== Player Functions ==============

    /// Place a bet in the current round
    /// Must be during BETTING phase
    /// Amount: 1 SUPRA <= amount <= 100,000 SUPRA
    public entry fun place_bet(
        player: &signer,
        game_addr: address,
        amount: u64,
    ) acquires GameState, CurrentRound, RoundBets, GameEvents {
        let player_addr = signer::address_of(player);
        
        // Validate game state
        let game = borrow_global_mut<GameState>(game_addr);
        assert!(!game.paused, error::invalid_state(E_GAME_PAUSED));
        
        // Validate bet amount
        assert!(amount >= MIN_BET, error::invalid_argument(E_INSUFFICIENT_BET));
        assert!(amount <= MAX_BET, error::invalid_argument(E_BET_TOO_LARGE));
        
        // Validate round status
        let round = borrow_global_mut<CurrentRound>(game_addr);
        assert!(round.status == STATUS_BETTING, error::invalid_state(E_ROUND_NOT_IN_BETTING_PHASE));
        
        // Check player hasn't already bet
        let round_bets = borrow_global_mut<RoundBets>(game_addr);
        assert!(!table::contains(&round_bets.bets, player_addr), error::already_exists(E_ALREADY_BET));
        
        // Transfer bet to escrow
        let bet_coins = coin::withdraw<SupraCoin>(player, amount);
        coin::merge(&mut round.bet_escrow, bet_coins);
        
        // Record bet
        let bet = PlayerBet {
            amount,
            cashed_out: false,
            cash_out_multiplier: 0,
            payout: 0,
        };
        table::add(&mut round_bets.bets, player_addr, bet);
        vector::push_back(&mut round_bets.players, player_addr);
        
        // Update round stats
        round.total_bets = round.total_bets + amount;
        round.player_count = round.player_count + 1;
        
        // Update game volume
        game.total_volume = game.total_volume + amount;
        
        // Emit event
        let events = borrow_global_mut<GameEvents>(game_addr);
        event::emit_event(&mut events.bet_placed, BetPlacedEvent {
            round_id: round.round_id,
            player: player_addr,
            amount,
            total_bets: round.total_bets,
        });
    }

    /// Cash out at current multiplier
    /// Must be during RUNNING phase and before crash
    public entry fun cash_out(
        player: &signer,
        game_addr: address,
    ) acquires GameState, CurrentRound, RoundBets, GameEvents {
        let player_addr = signer::address_of(player);
        
        let game = borrow_global_mut<GameState>(game_addr);
        let round = borrow_global_mut<CurrentRound>(game_addr);
        
        // Must be running
        assert!(round.status == STATUS_RUNNING, error::invalid_state(E_ROUND_NOT_RUNNING));
        
        // Get current multiplier
        let current_mult = calculate_multiplier(round.start_time);
        
        // Must not have crashed yet
        assert!(current_mult < round.crash_point, error::invalid_state(E_ROUND_CRASHED));
        
        // Get player's bet
        let round_bets = borrow_global_mut<RoundBets>(game_addr);
        assert!(table::contains(&round_bets.bets, player_addr), error::not_found(E_NO_BET_FOUND));
        
        let bet = table::borrow_mut(&mut round_bets.bets, player_addr);
        assert!(!bet.cashed_out, error::invalid_state(E_ALREADY_CASHED_OUT));
        
        // Calculate payout with house edge on profit
        let gross_payout = (bet.amount * current_mult) / PRECISION;
        let profit = if (gross_payout > bet.amount) { 
            gross_payout - bet.amount 
        } else { 
            0 
        };
        let house_cut = (profit * HOUSE_EDGE_BPS) / BPS_DENOMINATOR;
        let final_payout = gross_payout - house_cut;
        
        // Update bet record
        bet.cashed_out = true;
        bet.cash_out_multiplier = current_mult;
        bet.payout = final_payout;
        
        // Check escrow has enough (should always be true)
        let escrow_balance = coin::value(&round.bet_escrow);
        if (final_payout > escrow_balance) {
            // Use house pool for any shortfall
            let shortfall = final_payout - escrow_balance;
            let pool_balance = coin::value(&game.house_pool);
            assert!(pool_balance >= shortfall, error::invalid_state(E_INSUFFICIENT_POOL));
            
            let from_pool = coin::extract(&mut game.house_pool, shortfall);
            coin::merge(&mut round.bet_escrow, from_pool);
        };
        
        // Pay the player
        let payout_coins = coin::extract(&mut round.bet_escrow, final_payout);
        coin::deposit(player_addr, payout_coins);
        
        round.total_payouts = round.total_payouts + final_payout;
        
        // Emit event
        let events = borrow_global_mut<GameEvents>(game_addr);
        event::emit_event(&mut events.cash_out, CashOutEvent {
            round_id: round.round_id,
            player: player_addr,
            multiplier: current_mult,
            bet_amount: bet.amount,
            payout: final_payout,
            profit: if (final_payout > bet.amount) { final_payout - bet.amount } else { 0 },
        });
    }

    // ============== View Functions ==============

    #[view]
    public fun get_game_config(game_addr: address): (address, address, bool, u64, u64) acquires GameState {
        let game = borrow_global<GameState>(game_addr);
        (
            game.admin,
            game.treasury,
            game.paused,
            MIN_BET,
            MAX_BET,
        )
    }

    #[view]
    public fun get_game_stats(game_addr: address): (u64, u64, u64, u64) acquires GameState {
        let game = borrow_global<GameState>(game_addr);
        (
            game.total_rounds,
            game.total_volume,
            game.total_house_profit,
            coin::value(&game.house_pool),
        )
    }

    #[view]
    public fun get_round_info(game_addr: address): (u64, u8, u64, u64, u64) acquires CurrentRound {
        let round = borrow_global<CurrentRound>(game_addr);
        (
            round.round_id,
            round.status,
            round.total_bets,
            round.player_count,
            round.start_time,
        )
    }

    #[view]
    public fun get_current_multiplier(game_addr: address): u64 acquires CurrentRound {
        let round = borrow_global<CurrentRound>(game_addr);
        if (round.status != STATUS_RUNNING) {
            return PRECISION
        };
        calculate_multiplier(round.start_time)
    }

    #[view]
    public fun get_crash_point(game_addr: address): u64 acquires CurrentRound {
        let round = borrow_global<CurrentRound>(game_addr);
        if (round.status == STATUS_CRASHED) {
            round.crash_point
        } else {
            0 // Hidden until crash
        }
    }

    #[view]
    public fun get_player_bet(game_addr: address, player: address): (u64, bool, u64, u64) acquires RoundBets {
        let round_bets = borrow_global<RoundBets>(game_addr);
        if (!table::contains(&round_bets.bets, player)) {
            return (0, false, 0, 0)
        };
        let bet = table::borrow(&round_bets.bets, player);
        (bet.amount, bet.cashed_out, bet.cash_out_multiplier, bet.payout)
    }

    #[view]
    public fun has_crashed(game_addr: address): bool acquires CurrentRound {
        let round = borrow_global<CurrentRound>(game_addr);
        if (round.status == STATUS_CRASHED) {
            return true
        };
        if (round.status != STATUS_RUNNING) {
            return false
        };
        calculate_multiplier(round.start_time) >= round.crash_point
    }

    // ============== Internal Functions ==============

    /// Calculate crash point from VRF random value
    /// Uses exponential distribution with 3% house edge
    /// Returns value in PRECISION (e.g., 250 = 2.50x)
    fun calculate_crash_point(random: u64): u64 {
        let max_u64: u128 = 18446744073709551615;
        let r: u128 = (random as u128);
        
        let scale: u128 = 10000;
        let rtp: u128 = 9700; // 97% RTP (3% house edge)
        
        let r_scaled = (r * scale) / max_u64;
        let divisor = scale - (r_scaled * rtp) / scale;
        
        if (divisor == 0) {
            return 10000 // 100.00x max
        };
        
        let crash = ((scale * (PRECISION as u128)) / divisor) as u64;
        
        // Clamp to valid range [1.00x, 100.00x]
        if (crash < PRECISION) {
            PRECISION
        } else if (crash > 10000) {
            10000
        } else {
            crash
        }
    }

    /// Calculate current multiplier based on elapsed time
    /// Exponential growth: mult = e^(rate * time)
    fun calculate_multiplier(start_time: u64): u64 {
        let now = timestamp::now_seconds();
        if (now <= start_time) {
            return PRECISION
        };
        
        let elapsed = now - start_time;
        
        // Exponential approximation: 1 + rate*t + (rate*t)^2/2
        let base = PRECISION;
        let growth = (base * GROWTH_RATE_BPS * elapsed) / BPS_DENOMINATOR;
        let exp_term = (growth * growth) / (2 * base);
        
        base + growth + exp_term
    }
}