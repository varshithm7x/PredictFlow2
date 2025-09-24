/*
    FlowPredictionActions.cdc
    
    This contract implements Flow Actions for the Flow Predictions app.
    It leverages the Forte upgrade to create standardized, reusable onchain
    building blocks that can be composed into workflows.
*/

import FungibleToken from 0xf233dcee88fe0abe
import FlowToken from 0x1654653399040a61
import FlowPredictions from 0x0000000000000000 // Replace with actual address when deployed

pub contract FlowPredictionActions {

    // Events
    pub event ContractInitialized()
    pub event ActionExecuted(actionName: String, executor: Address)

    // Action interface
    pub resource interface ActionExecutor {
        pub fun execute(params: {String: AnyStruct}): {String: AnyStruct}
    }

    // Base action resource
    pub resource Action: ActionExecutor {
        pub let name: String
        pub let description: String
        pub let parameterSchema: {String: AnyStruct}
        pub let returnSchema: {String: AnyStruct}
        
        init(
            name: String,
            description: String,
            parameterSchema: {String: AnyStruct},
            returnSchema: {String: AnyStruct}
        ) {
            self.name = name
            self.description = description
            self.parameterSchema = parameterSchema
            self.returnSchema = returnSchema
        }
        
        pub fun execute(params: {String: AnyStruct}): {String: AnyStruct} {
            panic("Abstract method, must be implemented by subclasses")
        }
        
        pub fun getMetadata(): {String: AnyStruct} {
            return {
                "name": self.name,
                "description": self.description,
                "parameterSchema": self.parameterSchema,
                "returnSchema": self.returnSchema
            }
        }
    }

    // Create Ponder Action
    pub resource CreatePonderAction: ActionExecutor {
        pub let name: String
        pub let description: String
        pub let parameterSchema: {String: AnyStruct}
        pub let returnSchema: {String: AnyStruct}
        
        init() {
            self.name = "CreatePonder"
            self.description = "Creates a new prediction question (ponder) on Flow Predictions"
            
            self.parameterSchema = {
                "question": "String",
                "options": "[String]",
                "entryAmounts": "[UFix64]",
                "endTime": "UFix64",
                "featured": "Bool"
            }
            
            self.returnSchema = {
                "ponderId": "UInt64",
                "success": "Bool"
            }
        }
        
        pub fun execute(params: {String: AnyStruct}): {String: AnyStruct} {
            // Validate parameters
            let question = params["question"] as! String
            let options = params["options"] as! [String]
            let entryAmounts = params["entryAmounts"] as! [UFix64]
            let endTime = params["endTime"] as! UFix64
            let featured = params["featured"] as! Bool
            
            // Get reference to ponder collection
            let ponderCollectionRef = FlowPredictions.account
                .getCapability(FlowPredictions.PonderCollectionPublicPath)
                .borrow<&FlowPredictions.PonderCollection{FlowPredictions.PonderCollectionPublic}>()
                ?? panic("Could not borrow reference to ponder collection")
            
            // Create the ponder
            let ponderId = ponderCollectionRef.createPonder(
                creator: self.owner!.address,
                question: question,
                options: options,
                entryAmounts: entryAmounts,
                endTime: endTime,
                featured: featured
            )
            
            emit ActionExecuted(actionName: self.name, executor: self.owner!.address)
            
            return {
                "ponderId": ponderId,
                "success": true
            }
        }
        
        pub fun getMetadata(): {String: AnyStruct} {
            return {
                "name": self.name,
                "description": self.description,
                "parameterSchema": self.parameterSchema,
                "returnSchema": self.returnSchema
            }
        }
    }
    
    // Vote on Ponder Action
    pub resource VoteOnPonderAction: ActionExecutor {
        pub let name: String
        pub let description: String
        pub let parameterSchema: {String: AnyStruct}
        pub let returnSchema: {String: AnyStruct}
        
        init() {
            self.name = "VoteOnPonder"
            self.description = "Casts a vote on an existing prediction question"
            
            self.parameterSchema = {
                "ponderId": "UInt64",
                "optionIndex": "UInt8",
                "amount": "UFix64"
            }
            
            self.returnSchema = {
                "success": "Bool",
                "voteCounted": "Bool"
            }
        }
        
        pub fun execute(params: {String: AnyStruct}): {String: AnyStruct} {
            // Validate parameters
            let ponderId = params["ponderId"] as! UInt64
            let optionIndex = params["optionIndex"] as! UInt8
            let amount = params["amount"] as! UFix64
            
            // Get reference to ponder collection
            let ponderCollectionRef = FlowPredictions.account
                .getCapability(FlowPredictions.PonderCollectionPublicPath)
                .borrow<&FlowPredictions.PonderCollection{FlowPredictions.PonderCollectionPublic}>()
                ?? panic("Could not borrow reference to ponder collection")
            
            // Get the user's flow token vault
            let flowTokenVault = self.owner!.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
                ?? panic("Could not borrow reference to user's flow token vault")
            
            // Withdraw the amount for voting
            let paymentVault <- flowTokenVault.withdraw(amount: amount)
            
            // Cast the vote
            ponderCollectionRef.castVote(
                ponderId: ponderId,
                optionIndex: optionIndex,
                amount: amount,
                payment: <-paymentVault
            )
            
            emit ActionExecuted(actionName: self.name, executor: self.owner!.address)
            
            return {
                "success": true,
                "voteCounted": true
            }
        }
        
        pub fun getMetadata(): {String: AnyStruct} {
            return {
                "name": self.name,
                "description": self.description,
                "parameterSchema": self.parameterSchema,
                "returnSchema": self.returnSchema
            }
        }
    }
    
    // Claim Reward Action
    pub resource ClaimRewardAction: ActionExecutor {
        pub let name: String
        pub let description: String
        pub let parameterSchema: {String: AnyStruct}
        pub let returnSchema: {String: AnyStruct}
        
        init() {
            self.name = "ClaimReward"
            self.description = "Claims rewards for a winning prediction"
            
            self.parameterSchema = {
                "ponderId": "UInt64"
            }
            
            self.returnSchema = {
                "success": "Bool",
                "amount": "UFix64"
            }
        }
        
        pub fun execute(params: {String: AnyStruct}): {String: AnyStruct} {
            // Validate parameters
            let ponderId = params["ponderId"] as! UInt64
            
            // Get reference to ponder collection
            let ponderCollectionRef = FlowPredictions.account
                .getCapability(FlowPredictions.PonderCollectionPublicPath)
                .borrow<&FlowPredictions.PonderCollection{FlowPredictions.PonderCollectionPublic}>()
                ?? panic("Could not borrow reference to ponder collection")
            
            // Claim the reward
            let rewardVault <- ponderCollectionRef.claimReward(ponderId: ponderId)
            let rewardAmount = rewardVault.balance
            
            // Deposit the reward to the user's vault
            let flowTokenVault = self.owner!.borrow<&FlowToken.Vault{FungibleToken.Receiver}>(from: /storage/flowTokenVault)
                ?? panic("Could not borrow reference to user's flow token vault")
            
            flowTokenVault.deposit(from: <-rewardVault)
            
            emit ActionExecuted(actionName: self.name, executor: self.owner!.address)
            
            return {
                "success": true,
                "amount": rewardAmount
            }
        }
        
        pub fun getMetadata(): {String: AnyStruct} {
            return {
                "name": self.name,
                "description": self.description,
                "parameterSchema": self.parameterSchema,
                "returnSchema": self.returnSchema
            }
        }
    }
    
    // Scheduled Resolution Action
    pub resource ScheduledResolutionAction: ActionExecutor {
        pub let name: String
        pub let description: String
        pub let parameterSchema: {String: AnyStruct}
        pub let returnSchema: {String: AnyStruct}
        
        init() {
            self.name = "ScheduledResolution"
            self.description = "Resolves a ponder after its end time has passed"
            
            self.parameterSchema = {
                "ponderId": "UInt64"
            }
            
            self.returnSchema = {
                "success": "Bool",
                "resolved": "Bool",
                "winningOptionIndex": "UInt8?"
            }
        }
        
        pub fun execute(params: {String: AnyStruct}): {String: AnyStruct} {
            // Validate parameters
            let ponderId = params["ponderId"] as! UInt64
            
            // Get reference to ponder collection
            let ponderCollectionRef = FlowPredictions.account
                .borrow<&FlowPredictions.PonderCollection>(from: FlowPredictions.PonderCollectionStoragePath)
                ?? panic("Could not borrow reference to ponder collection")
            
            // Resolve the ponder
            ponderCollectionRef.resolvePonder(id: ponderId)
            
            // Get updated ponder info
            let ponderInfo = ponderCollectionRef.getPonderInfo(id: ponderId)!
            
            emit ActionExecuted(actionName: self.name, executor: self.owner!.address)
            
            return {
                "success": true,
                "resolved": ponderInfo["resolved"] as! Bool,
                "winningOptionIndex": ponderInfo["winningOptionIndex"]
            }
        }
        
        pub fun getMetadata(): {String: AnyStruct} {
            return {
                "name": self.name,
                "description": self.description,
                "parameterSchema": self.parameterSchema,
                "returnSchema": self.returnSchema
            }
        }
    }

    // Initialize the contract
    init() {
        emit ContractInitialized()
    }
    
    // Create action resources
    pub fun createCreatePonderAction(): @CreatePonderAction {
        return <-create CreatePonderAction()
    }
    
    pub fun createVoteOnPonderAction(): @VoteOnPonderAction {
        return <-create VoteOnPonderAction()
    }
    
    pub fun createClaimRewardAction(): @ClaimRewardAction {
        return <-create ClaimRewardAction()
    }
    
    pub fun createScheduledResolutionAction(): @ScheduledResolutionAction {
        return <-create ScheduledResolutionAction()
    }
}
