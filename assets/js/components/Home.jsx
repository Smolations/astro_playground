import * as React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { Jumbotron, Button, Row, Col } from 'reactstrap'

export default class Home extends React.Component<{}, {}> {
  constructor(props) {
    super(props)
  }

  public render(): JSX.Element {
    return (
      <div>
        {/* Be sure to always wrap the content of a component in an enclosing
         element (e.g. `<div>`) */}
      </div>
    )
  }
}
