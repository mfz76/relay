import TriggerNode from './TriggerNode'
import AnalyzeNode from './AnalyzeNode'
import ConditionNode from './ConditionNode'
import ActionNode from './ActionNode'

export const nodeTypes = {
  trigger: TriggerNode,
  analyze: AnalyzeNode,
  condition: ConditionNode,
  action: ActionNode,
}

export { TriggerNode, AnalyzeNode, ConditionNode, ActionNode }
