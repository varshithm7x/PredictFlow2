/*
    FlowPredictions.cdc
    
    This contract implements the core functionality for the Flow Predictions app.
    It allows users to create prediction questions (ponders), vote on them with
    different entry amounts, and distribute rewards to winners.
    
    The contract utilizes Flow's resource-oriented programming model and the
    new Forte Actions and Workflows for automation.
*/

import FungibleToken from 0xf233dcee88fe0abe
import FlowToken from 0x1654653399040a61
import MetadataViews from 0x1d7e57aa55817448

pub contract FlowPredictions {

    // Events
    pub event ContractInitialized()
    pub event PonderCreated(id: UInt64, creator: Address, question: String, endTime: UFix64, featured: Bool)
    pub event VoteCast(ponderId: UInt64, voter: Address, optionIndex: UInt8, amount: UFix64)
    pub event PonderResolved(id: UInt64, winningOptionIndex: UInt8, totalPool: UFix64)
    pub event RewardsClaimed(ponderId: UInt64, winner: Address, amount: UFix64)

    // Paths
    pub let AdminStoragePath: StoragePath
    pub let PonderCollectionStoragePath: StoragePath
    pub let PonderCollectionPublicPath: PublicPath
    pub let UserProfileStoragePath: StoragePath
    pub let UserProfilePublicPath: PublicPath

    // Contract state
    pub var totalPonders: UInt64
    pub var featuredPoolAmount: UFix64
    pub var platformFeePercentage: UFix64
    
    // Structure to store ponder options
    pub struct PonderOption {
        pub let text: String
        pub var votes: UInt64
        pub var totalAmount: UFix64
        
        init(text: String) {
            self.text = text
            self.votes = 0
            self.totalAmount = 0.0
        }
        
        pub fun addVote(amount: UFix64) {
            self.votes = self.votes + 1
            self.totalAmount = self.totalAmount + amount
        }
    }
    
    // Structure to store a vote
    pub struct Vote {
        pub let voter: Address
        pub let optionIndex: UInt8
        pub let amount: UFix64
        pub let timestamp: UFix64
        
        init(voter: Address, optionIndex: UInt8, amount: UFix64) {
            self.voter = voter
            self.optionIndex = optionIndex
            self.amount = amount
            self.timestamp = getCurrentBlock().timestamp
        }
    }
    
    // Resource representing a prediction question (ponder)
    pub resource Ponder {
        pub let id: UInt64
        pub let creator: Address
        pub let question: String
        pub let options: [PonderOption]
        pub let entryAmounts: [UFix64]
        pub let endTime: UFix64
        pub let featured: Bool
        pub let createdAt: UFix64
        
        pub var totalPool: UFix64
        pub var votes: [Vote]
        pub var resolved: Bool
        pub var winningOptionIndex: UInt8?
        pub var platformFee: UFix64
        
        init(
            creator: Address,
            question: String,
            options: [String],
            entryAmounts: [UFix64],
            endTime: UFix64,
            featured: Bool
        ) {
            pre {
                options.length >= 2: "Ponder must have at least 2 options"
                entryAmounts.length > 0: "Ponder must have at least one entry amount"
                endTime > getCurrentBlock().timestamp: "End time must be in the future"
            }
            
            self.id = FlowPredictions.totalPonders
            self.creator = creator
            self.question = question
            self.options = []
            self.entryAmounts = entryAmounts
            self.endTime = endTime
            self.featured = featured
            self.createdAt = getCurrentBlock().timestamp
            
            self.totalPool = featured ? FlowPredictions.featuredPoolAmount : 0.0
            self.votes = []
            self.resolved = false
            self.winningOptionIndex = nil
            self.platformFee = 0.0
            
            // Initialize options
            for option in options {
                self.options.append(PonderOption(text: option))
            }
            
            // Increment total ponders
            FlowPredictions.totalPonders = FlowPredictions.totalPonders + 1
            
            emit PonderCreated(
                id: self.id,
                creator: self.creator,
                question: self.question,
                endTime: self.endTime,
                featured: self.featured
            )
            
            // Schedule resolution when the ponder ends
            self.scheduleResolution()
        }
        
        // Cast a vote on this ponder
        pub fun castVote(voter: Address, optionIndex: UInt8, amount: UFix64, payment: @FungibleToken.Vault) {
            pre {
                !self.resolved: "Ponder is already resolved"
                getCurrentBlock().timestamp < self.endTime: "Voting period has ended"
                optionIndex < UInt8(self.options.length): "Invalid option index"
                self.entryAmounts.contains(amount): "Invalid entry amount"
                payment.balance == amount: "Payment amount does not match vote amount"
            }
            
            // Add vote to the ponder
            let vote = Vote(voter: voter, optionIndex: optionIndex, amount: amount)
            self.votes.append(vote)
            
            // Update option stats
            self.options[optionIndex].addVote(amount: amount)
            
            // Update total pool
            self.totalPool = self.totalPool + amount
            
            // Calculate platform fee
            let fee = amount * FlowPredictions.platformFeePercentage
            self.platformFee = self.platformFee + fee
            
            // Deposit payment to the contract
            let ponderVault = FlowPredictions.account.getCapability(/public/flowTokenVault)
                .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()
                ?? panic("Could not borrow reference to the vault")
            
            ponderVault.deposit(from: <-payment)
            
            emit VoteCast(ponderId: self.id, voter: voter, optionIndex: optionIndex, amount: amount)
        }
        
        // Resolve the ponder and determine the winner
        pub fun resolve() {
            pre {
                !self.resolved: "Ponder is already resolved"
                getCurrentBlock().timestamp >= self.endTime: "Voting period has not ended"
            }
            
            // Find the option with the most votes
            var maxVotes: UInt64 = 0
            var winningIndex: UInt8 = 0
            
            var i: UInt8 = 0
            while i < UInt8(self.options.length) {
                let option = self.options[i]
                if option.votes > maxVotes {
                    maxVotes = option.votes
                    winningIndex = i
                }
                i = i + 1
            }
            
            self.winningOptionIndex = winningIndex
            self.resolved = true
            
            emit PonderResolved(id: self.id, winningOptionIndex: winningIndex, totalPool: self.totalPool)
        }
        
        // Schedule the resolution of this ponder using Flow's scheduled transactions
        pub fun scheduleResolution() {
            // This would use Flow's scheduled transactions feature
            // For now, it's a placeholder for the actual implementation
        }
        
        // Claim rewards for a winning vote
        pub fun claimReward(voter: Address): @FungibleToken.Vault {
            pre {
                self.resolved: "Ponder is not resolved yet"
                self.winningOptionIndex != nil: "No winning option determined"
            }
            
            // Find the user's vote
            let winningOptionIndex = self.winningOptionIndex!
            var userVoteIndex: Int? = nil
            var userVoteAmount: UFix64 = 0.0
            
            var i = 0
            while i < self.votes.length {
                let vote = self.votes[i]
                if vote.voter == voter && vote.optionIndex == winningOptionIndex {
                    userVoteIndex = i
                    userVoteAmount = vote.amount
                    break
                }
                i = i + 1
            }
            
            // Ensure the user has a winning vote
            if userVoteIndex == nil || userVoteAmount == 0.0 {
                panic("No winning vote found for this user")
            }
            
            // Calculate reward
            let winningOption = self.options[winningOptionIndex]
            let rewardPool = self.totalPool - self.platformFee
            let userShare = userVoteAmount / winningOption.totalAmount
            let reward = rewardPool * userShare
            
            // Get the vault to withdraw from
            let vaultRef = FlowPredictions.account.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
                ?? panic("Could not borrow reference to the vault")
            
            // Create a new vault with the reward amount
            let rewardVault <- vaultRef.withdraw(amount: reward)
            
            emit RewardsClaimed(ponderId: self.id, winner: voter, amount: reward)
            
            return <-rewardVault
        }
        
        // Get public information about this ponder
        pub fun getInfo(): {String: AnyStruct} {
            return {
                "id": self.id,
                "creator": self.creator,
                "question": self.question,
                "options": self.options,
                "entryAmounts": self.entryAmounts,
                "endTime": self.endTime,
                "featured": self.featured,
                "createdAt": self.createdAt,
                "totalPool": self.totalPool,
                "votesCount": self.votes.length,
                "resolved": self.resolved,
                "winningOptionIndex": self.winningOptionIndex
            }
        }
    }
    
    // Resource interface for the public-facing ponder collection
    pub resource interface PonderCollectionPublic {
        pub fun getPonderIDs(): [UInt64]
        pub fun getPonderInfo(id: UInt64): {String: AnyStruct}?
        pub fun castVote(ponderId: UInt64, optionIndex: UInt8, amount: UFix64, payment: @FungibleToken.Vault)
        pub fun claimReward(ponderId: UInt64): @FungibleToken.Vault
    }
    
    // Resource for managing a collection of ponders
    pub resource PonderCollection: PonderCollectionPublic {
        pub var ponders: @{UInt64: Ponder}
        
        init() {
            self.ponders <- {}
        }
        
        // Create a new ponder
        pub fun createPonder(
            creator: Address,
            question: String,
            options: [String],
            entryAmounts: [UFix64],
            endTime: UFix64,
            featured: Bool
        ): UInt64 {
            let ponder <- create Ponder(
                creator: creator,
                question: question,
                options: options,
                entryAmounts: entryAmounts,
                endTime: endTime,
                featured: featured
            )
            
            let id = ponder.id
            self.ponders[id] <-! ponder
            
            return id
        }
        
        // Get all ponder IDs in this collection
        pub fun getPonderIDs(): [UInt64] {
            return self.ponders.keys
        }
        
        // Get information about a specific ponder
        pub fun getPonderInfo(id: UInt64): {String: AnyStruct}? {
            if let ponder = &self.ponders[id] as &Ponder? {
                return ponder.getInfo()
            }
            return nil
        }
        
        // Cast a vote on a ponder
        pub fun castVote(ponderId: UInt64, optionIndex: UInt8, amount: UFix64, payment: @FungibleToken.Vault) {
            let ponder = &self.ponders[ponderId] as &Ponder? ?? panic("Ponder not found")
            ponder.castVote(voter: payment.owner!.address, optionIndex: optionIndex, amount: amount, payment: <-payment)
        }
        
        // Resolve a ponder
        pub fun resolvePonder(id: UInt64) {
            let ponder = &self.ponders[id] as &Ponder? ?? panic("Ponder not found")
            ponder.resolve()
        }
        
        // Claim reward for a winning vote
        pub fun claimReward(ponderId: UInt64): @FungibleToken.Vault {
            let ponder = &self.ponders[ponderId] as &Ponder? ?? panic("Ponder not found")
            return <-ponder.claimReward(voter: self.owner!.address)
        }
        
        destroy() {
            destroy self.ponders
        }
    }
    
    // Resource for tracking user profile and statistics
    pub resource UserProfile {
        pub let address: Address
        pub var username: String?
        pub var votesCount: UInt64
        pub var winsCount: UInt64
        pub var totalWinnings: UFix64
        pub var createdPonders: [UInt64]
        pub var votedPonders: {UInt64: UInt8}
        
        init(address: Address) {
            self.address = address
            self.username = nil
            self.votesCount = 0
            self.winsCount = 0
            self.totalWinnings = 0.0
            self.createdPonders = []
            self.votedPonders = {}
        }
        
        // Update profile when user casts a vote
        pub fun recordVote(ponderId: UInt64, optionIndex: UInt8) {
            self.votesCount = self.votesCount + 1
            self.votedPonders[ponderId] = optionIndex
        }
        
        // Update profile when user wins a prediction
        pub fun recordWin(ponderId: UInt64, amount: UFix64) {
            self.winsCount = self.winsCount + 1
            self.totalWinnings = self.totalWinnings + amount
        }
        
        // Update profile when user creates a ponder
        pub fun recordCreatedPonder(ponderId: UInt64) {
            self.createdPonders.append(ponderId)
        }
        
        // Set or update username
        pub fun setUsername(username: String) {
            self.username = username
        }
        
        // Get user statistics
        pub fun getStats(): {String: AnyStruct} {
            let accuracy = self.votesCount > 0 
                ? UFix64(self.winsCount) / UFix64(self.votesCount)
                : 0.0
                
            return {
                "address": self.address,
                "username": self.username,
                "votesCount": self.votesCount,
                "winsCount": self.winsCount,
                "accuracy": accuracy,
                "totalWinnings": self.totalWinnings,
                "createdPondersCount": self.createdPonders.length
            }
        }
    }
    
    // Resource for contract administration
    pub resource Admin {
        // Update the featured pool amount
        pub fun setFeaturedPoolAmount(amount: UFix64) {
            FlowPredictions.featuredPoolAmount = amount
        }
        
        // Update the platform fee percentage
        pub fun setPlatformFeePercentage(percentage: UFix64) {
            pre {
                percentage >= 0.0 && percentage <= 0.2: "Fee percentage must be between 0 and 20%"
            }
            FlowPredictions.platformFeePercentage = percentage
        }
        
        // Withdraw platform fees
        pub fun withdrawPlatformFees(amount: UFix64): @FungibleToken.Vault {
            let vaultRef = FlowPredictions.account.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
                ?? panic("Could not borrow reference to the vault")
            
            return <-vaultRef.withdraw(amount: amount)
        }
    }
    
    // Initialize the contract
    init() {
        self.AdminStoragePath = /storage/flowPredictionsAdmin
        self.PonderCollectionStoragePath = /storage/flowPredictionsPonderCollection
        self.PonderCollectionPublicPath = /public/flowPredictionsPonderCollection
        self.UserProfileStoragePath = /storage/flowPredictionsUserProfile
        self.UserProfilePublicPath = /public/flowPredictionsUserProfile
        
        self.totalPonders = 0
        self.featuredPoolAmount = 100.0 // 100 FLOW for featured ponders
        self.platformFeePercentage = 0.05 // 5% platform fee
        
        // Create admin resource
        let admin <- create Admin()
        self.account.save(<-admin, to: self.AdminStoragePath)
        
        // Create ponder collection
        let ponderCollection <- create PonderCollection()
        self.account.save(<-ponderCollection, to: self.PonderCollectionStoragePath)
        self.account.link<&PonderCollection{PonderCollectionPublic}>(
            self.PonderCollectionPublicPath,
            target: self.PonderCollectionStoragePath
        )
        
        emit ContractInitialized()
    }
    
    // Create a new user profile
    pub fun createUserProfile(address: Address): @UserProfile {
        return <-create UserProfile(address: address)
    }
    
    // Create a new ponder collection
    pub fun createPonderCollection(): @PonderCollection {
        return <-create PonderCollection()
    }
}
