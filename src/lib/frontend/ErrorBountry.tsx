import React, { ErrorInfo } from "react";

type Props = {
    children: React.ReactNode;
    fallback: React.ReactNode;
}

type State = {
    hasError: boolean
}

class ErrorBoundary  extends React.Component<Props, State>{

    constructor(props: Props){
        super(props)
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error: Error){
        return {hasError: true}

    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.log(error, errorInfo);
    }

    render(){
        if(this.state.hasError){
            return this.props.fallback;
        }
        return this.props.children
    }
}

export default ErrorBoundary 