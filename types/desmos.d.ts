declare namespace Desmos {
  interface Calculator {
    destroy(): void
    resize(): void
    setBlank(): void
    getState(): unknown
    setState(state: unknown): void
  }

  interface CalculatorOptions {
    expressions?: boolean
    settingsMenu?: boolean
    zoomButtons?: boolean
    expressionsTopbar?: boolean
    pointsOfInterest?: boolean
    trace?: boolean
    border?: boolean
    lockViewport?: boolean
    expressionsCollapsed?: boolean
    administerSecretFolders?: boolean
    images?: boolean
    folders?: boolean
    notes?: boolean
    sliders?: boolean
    links?: boolean
    qwertyKeyboard?: boolean
    restrictedFunctions?: boolean
    forceEnableGeometryFunctions?: boolean
    pasteGraphLink?: boolean
    pasteTableData?: boolean
    clearIntoDegreeMode?: boolean
    autosize?: boolean
    plotSingleVariableImplicitEquations?: boolean
    plotImplicits?: boolean
    plotInequalities?: boolean
  }

  function GraphingCalculator(
    element: HTMLElement,
    options?: CalculatorOptions
  ): Calculator

  function ScientificCalculator(
    element: HTMLElement,
    options?: Record<string, unknown>
  ): Calculator

  function FourFunctionCalculator(
    element: HTMLElement,
    options?: Record<string, unknown>
  ): Calculator
}
