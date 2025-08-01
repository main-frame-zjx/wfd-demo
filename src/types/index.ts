import { Moment } from 'moment';
export interface IDefaultModel {
  id?: string;
  clazz?: 'start' | 'end' | 'gateway' | 'exclusiveGateway' | 'parallelGateway' | 'inclusiveGateway'
  | 'timerStart' | 'messageStart' | 'signalStart' | 'userTask' | 'scriptTask' | 'mailTask'
  | 'javaTask' | 'receiveTask' | 'timerCatch' | 'messageCatch' | 'signalCatch' | 'subProcess' | 'flow' | 'process' | 'combinedEdge';
  label?: string;
  x?: number;
  y?: number;
  active?: boolean;
  hideIcon?: boolean;
}
export interface IJavaModel extends IDefaultModel {
  javaClass?: string;
}
export interface IMailModel extends IDefaultModel {
  to?: string;
  subject?: string;
  content?: string;
}
export interface IUserModel extends IDefaultModel {
  assignType?: 'person' | 'persongroup' | 'custom';
  assignValue?: string;
  dueDate?: Moment;
  isSequential?: boolean;
  javaClass?: string;
}
export interface IMessageModel extends IDefaultModel {
  message?: string;
}
export interface IReceiveModel extends IDefaultModel {
  waitState?: string;
  stateValue?: string;
}
export interface IScriptModel extends IDefaultModel {
  script?: string;
}
export interface ISignalModel extends IDefaultModel {
  signal?: string;
}
export interface ITimerModel extends IDefaultModel {
  cycle?: string;
  duration?: string;
}

export interface IFlowModel extends IDefaultModel {
  source?: string;
  target?: string;
  sourceAnchor?: number;
  targetAnchor?: number;
  conditionExpression?: string;
  seq?: string;
  reverse?: boolean;
  MxLabel?: string,
  MxFileName?: string,
  currentRate?: number;
}


export interface ICombinedEdgeModel extends IDefaultModel {
  source?: string;
  target?: string;
  sourceAnchor?: number;
  targetAnchor?: number;
  conditionExpression?: string;
  seq?: string;
  reverse?: boolean;
  MxLabel?: string,
  MxFileName?: string,
  useMaxCalcRate?: boolean,
  currentRate?: object[],
  fileNameArray?: object[],
  portInstanceIndexArray?: object[];
}
export interface IProcessModel extends IDefaultModel {
  name?: string;
  dataObjs?: object[];
  signalDefs?: object[];
  messageDefs?: object[];
  windowSize?: number;
  stepSize?: number;
  fpsmax?: number;
  fps?: number;
  dpcId?: number;
  useCombinedEdge?: boolean,
  currentCycle?: number;
}

export interface ISelectData {
  id?: string;
  name?: string;
}
