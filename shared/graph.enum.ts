export enum DagMode{
  NONE = "",
  TOP_DOWN  = "td",
  BOTTOM_UP  = "bu",
  LEFT_RIGHT = "lr",
  RIGHT_LEFT  = "rl",
  NEAR_TO_FAR = "zour",
  FAR_TO_NEAR = "zin",
  RAD_OUTWARDS = "radialout",
  RAD_INWARDS = "radialin",
}

export enum ElementVisibility{
  OFF = 0, 
  HIDDEN = 1, 
  ON = 2,
}

export enum NodeColorScheme{
  GROUP = 0, 
  CLUSTER = 1,
}
  
export enum LinkColorScheme{
  GROUP = 0, 
  SOURCE =1, 
  TARGET = 2,
}

export enum DisplayMode{
  NORMAL = 0,
  TWO_DIMENSIONS = 1
}