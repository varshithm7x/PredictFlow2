/*
    FlowPredictionWorkflows.cdc
    
    This contract implements workflows for the Flow Predictions app using
    Flow's Forte upgrade features. Workflows combine multiple actions into
    reusable, composable sequences with time-based triggers.
*/

import FlowPredictions from 0x0000000000000000 // Replace with actual address when deployed
import FlowPredictionActions from 0x0000000000000000 // Replace with actual address when deployed

pub contract FlowPredictionWorkflows {

    // Events
    pub event ContractInitialized()
    pub event WorkflowExecuted(workflowName: String, executor: Address)
    pub event WorkflowScheduled(workflowName: String, scheduledTime: UFix64)

    // Workflow interface
    pub resource interface WorkflowExecutor {
        pub fun execute(params: {String: AnyStruct}): {String: AnyStruct}
    }

    // Base workflow resource
    pub resource Workflow: WorkflowExecutor {
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

    // Create and Vote Workflow
    pub resource CreateAndVoteWorkflow: WorkflowExecutor {
        pub let name: String
        pub let description: String
        pub let parameterSchema: {String: AnyStruct}
        pub let returnSchema: {String: AnyStruct}
        
        init() {
            self.name = "CreateAndVote"
            self.description = "Creates a new ponder and immediately casts a vote on it"
            
            self.parameterSchema = {
                "question": "String",
                "options": "[String]",
                "entryAmounts": "[UFix64]",
                "endTime": "UFix64",
                "featured": "Bool",
                "voteOptionIndex": "UInt8",
                "voteAmount": "UFix64"
            }
            
            self.returnSchema = {
                "ponderId": "UInt64",
                "createSuccess": "Bool",
                "voteSuccess": "Bool"
            }
        }
        
        pub fun execute(params: {String: AnyStruct}): {String: AnyStruct} {
            // Step 1: Create the ponder
            let createPonderAction <- FlowPredictionActions.createCreatePonderAction()
            
            let createParams: {String: AnyStruct} = {
                "question": params["question"]!,
                "options": params["options"]!,
                "entryAmounts": params["entryAmounts"]!,
                "endTime": params["endTime"]!,
                "featured": params["featured"]!
            }
            
            let createResult = createPonderAction.execute(params: createParams)
            let ponderId = createResult["ponderId"] as! UInt64
            
            destroy createPonderAction
            
            // Step 2: Vote on the ponder
            let voteOnPonderAction <- FlowPredictionActions.createVoteOnPonderAction()
            
            let voteParams: {String: AnyStruct} = {
                "ponderId": ponderId,
                "optionIndex": params["voteOptionIndex"]!,
                "amount": params["voteAmount"]!
            }
            
            let voteResult = voteOnPonderAction.execute(params: voteParams)
            
            destroy voteOnPonderAction
            
            emit WorkflowExecuted(workflowName: self.name, executor: self.owner!.address)
            
            return {
                "ponderId": ponderId,
                "createSuccess": createResult["success"],
                "voteSuccess": voteResult["success"]
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
    
    // Scheduled Resolution and Notification Workflow
    pub resource ScheduledResolutionWorkflow: WorkflowExecutor {
        pub let name: String
        pub let description: String
        pub let parameterSchema: {String: AnyStruct}
        pub let returnSchema: {String: AnyStruct}
        
        init() {
            self.name = "ScheduledResolution"
            self.description = "Schedules a ponder to be resolved at its end time"
            
            self.parameterSchema = {
                "ponderId": "UInt64",
                "endTime": "UFix64"
            }
            
            self.returnSchema = {
                "success": "Bool",
                "scheduledTime": "UFix64"
            }
        }
        
        pub fun execute(params: {String: AnyStruct}): {String: AnyStruct} {
            // Get parameters
            let ponderId = params["ponderId"] as! UInt64
            let endTime = params["endTime"] as! UFix64
            
            // Schedule the resolution action to be executed at the end time
            // This would use Flow's scheduled transactions feature
            // For now, it's a placeholder for the actual implementation
            
            emit WorkflowScheduled(workflowName: self.name, scheduledTime: endTime)
            
            return {
                "success": true,
                "scheduledTime": endTime
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
    
    // Batch Vote Workflow
    pub resource BatchVoteWorkflow: WorkflowExecutor {
        pub let name: String
        pub let description: String
        pub let parameterSchema: {String: AnyStruct}
        pub let returnSchema: {String: AnyStruct}
        
        init() {
            self.name = "BatchVote"
            self.description = "Casts votes on multiple ponders in a single transaction"
            
            self.parameterSchema = {
                "votes": "[{ponderId: UInt64, optionIndex: UInt8, amount: UFix64}]"
            }
            
            self.returnSchema = {
                "successCount": "Int",
                "failedCount": "Int",
                "results": "[{ponderId: UInt64, success: Bool}]"
            }
        }
        
        pub fun execute(params: {String: AnyStruct}): {String: AnyStruct} {
            let votes = params["votes"] as! [{String: AnyStruct}]
            var successCount = 0
            var failedCount = 0
            var results: [{String: AnyStruct}] = []
            
            // Process each vote
            for vote in votes {
                let ponderId = vote["ponderId"] as! UInt64
                let optionIndex = vote["optionIndex"] as! UInt8
                let amount = vote["amount"] as! UFix64
                
                let voteAction <- FlowPredictionActions.createVoteOnPonderAction()
                
                let voteParams: {String: AnyStruct} = {
                    "ponderId": ponderId,
                    "optionIndex": optionIndex,
                    "amount": amount
                }
                
                var success = true
                
                // Try to execute the vote action
                do {
                    let voteResult = voteAction.execute(params: voteParams)
                    success = voteResult["success"] as! Bool
                } catch {
                    success = false
                }
                
                destroy voteAction
                
                // Record the result
                if success {
                    successCount = successCount + 1
                } else {
                    failedCount = failedCount + 1
                }
                
                results.append({
                    "ponderId": ponderId,
                    "success": success
                })
            }
            
            emit WorkflowExecuted(workflowName: self.name, executor: self.owner!.address)
            
            return {
                "successCount": successCount,
                "failedCount": failedCount,
                "results": results
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
    
    // Automated Claim Rewards Workflow
    pub resource AutoClaimRewardsWorkflow: WorkflowExecutor {
        pub let name: String
        pub let description: String
        pub let parameterSchema: {String: AnyStruct}
        pub let returnSchema: {String: AnyStruct}
        
        init() {
            self.name = "AutoClaimRewards"
            self.description = "Automatically claims rewards for all winning predictions"
            
            self.parameterSchema = {
                "ponderIds": "[UInt64]?"
            }
            
            self.returnSchema = {
                "totalClaimed": "UFix64",
                "successCount": "Int",
                "failedCount": "Int",
                "results": "[{ponderId: UInt64, success: Bool, amount: UFix64}]"
            }
        }
        
        pub fun execute(params: {String: AnyStruct}): {String: AnyStruct} {
            var ponderIds: [UInt64] = []
            
            // If ponderIds are provided, use them
            if params.containsKey("ponderIds") {
                ponderIds = params["ponderIds"] as! [UInt64]
            } else {
                // Otherwise, get all ponder IDs from the collection
                let ponderCollectionRef = FlowPredictions.account
                    .getCapability(FlowPredictions.PonderCollectionPublicPath)
                    .borrow<&FlowPredictions.PonderCollection{FlowPredictions.PonderCollectionPublic}>()
                    ?? panic("Could not borrow reference to ponder collection")
                
                ponderIds = ponderCollectionRef.getPonderIDs()
            }
            
            var totalClaimed: UFix64 = 0.0
            var successCount = 0
            var failedCount = 0
            var results: [{String: AnyStruct}] = []
            
            // Try to claim rewards for each ponder
            for ponderId in ponderIds {
                let claimAction <- FlowPredictionActions.createClaimRewardAction()
                
                let claimParams: {String: AnyStruct} = {
                    "ponderId": ponderId
                }
                
                var success = true
                var amount: UFix64 = 0.0
                
                // Try to execute the claim action
                do {
                    let claimResult = claimAction.execute(params: claimParams)
                    success = claimResult["success"] as! Bool
                    amount = claimResult["amount"] as! UFix64
                    
                    if success {
                        totalClaimed = totalClaimed + amount
                    }
                } catch {
                    success = false
                }
                
                destroy claimAction
                
                // Record the result
                if success {
                    successCount = successCount + 1
                } else {
                    failedCount = failedCount + 1
                }
                
                results.append({
                    "ponderId": ponderId,
                    "success": success,
                    "amount": amount
                })
            }
            
            emit WorkflowExecuted(workflowName: self.name, executor: self.owner!.address)
            
            return {
                "totalClaimed": totalClaimed,
                "successCount": successCount,
                "failedCount": failedCount,
                "results": results
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
    
    // Create workflow resources
    pub fun createCreateAndVoteWorkflow(): @CreateAndVoteWorkflow {
        return <-create CreateAndVoteWorkflow()
    }
    
    pub fun createScheduledResolutionWorkflow(): @ScheduledResolutionWorkflow {
        return <-create ScheduledResolutionWorkflow()
    }
    
    pub fun createBatchVoteWorkflow(): @BatchVoteWorkflow {
        return <-create BatchVoteWorkflow()
    }
    
    pub fun createAutoClaimRewardsWorkflow(): @AutoClaimRewardsWorkflow {
        return <-create AutoClaimRewardsWorkflow()
    }
}
