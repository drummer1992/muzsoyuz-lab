export const makeInitialState = subStates => {
  const initialState = {
    data  : null,
    status: "idle",
    error : null,
  }

  if (!subStates) {
    return initialState
  }

  return subStates.reduce((state, subStateName) => ({
    ...state,
    [subStateName]: { ...initialState },
  }), {})
}