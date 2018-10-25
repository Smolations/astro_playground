import * as React from 'react'
import { Container } from 'reactstrap'

export default class Root extends React.Component<{}, {}> {
  public render(): JSX.Element {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}
