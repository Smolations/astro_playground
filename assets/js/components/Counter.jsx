import * as React from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'reactstrap'

// Interface for the Counter component state
// interface CounterState {
//   currentCount: number
// }

const initialState = { currentCount: 0 }

export default class Counter extends React.Component {
  constructor() {
    super()
    // Set the initial state of the component in a constructor.
    this.state = initialState
  }

  render() {
    return (
      <div>
        <h1>Counter</h1>
        <p>The Counter is the simplest example of what you can do with a React component.</p>
        <p>
          Current count: <strong>{this.state.currentCount}</strong>
        </p>
        {/* We apply an onClick event to these buttons to their corresponding functions */}
        <Button
          color="primary"
          onClick={() => {
            this.incrementCounter()
          }}
        >
          Increment counter
        </Button>{' '}
        <Button
          color="secondary"
          onClick={() => {
            this.decrementCounter()
          }}
        >
          Decrement counter
        </Button>{' '}
        <Button
          color="secondary"
          onClick={() => {
            this.resetCounter()
          }}
        >
          Reset counter
        </Button>
        <br />
        <br />
        <p>
          <Link to="/">Back to home</Link>
        </p>
      </div>
    )
  }

  incrementCounter() {
    this.setState({
      currentCount: this.state.currentCount + 1
    })
  }

  decrementCounter() {
    this.setState({
      currentCount: this.state.currentCount - 1
    })
  }

  resetCounter() {
    this.setState({
      currentCount: 0
    })
  }
}
