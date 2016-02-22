// Type definitions for react-spinkit 1.1.4
// Project: https://github.com/KyleAMathews/react-spinkit
// Definitions by: Qubo <https://github.com/tkqubo>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../react/react.d.ts" />

declare module "react-spinkit" {
    import { Component } from 'react';
    
    function s(): s.Spinner;

    module s {
      class Spinner extends Component<{
        spinnerName?: string;
        overrideSpinnerClassName?: string;
        noFadeIn?: boolean;
      }, {}> { }
    }

    export = s
}

