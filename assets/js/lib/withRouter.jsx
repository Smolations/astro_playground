import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

// react-router v6 dropped `withRouter`. This shim injects the RR5-style props
// (match.params, history.push, location, navigate) so the existing class
// components keep working without being rewritten as hooks.
export default function withRouter(Component) {
  return function WithRouter(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    return (
      <Component
        {...props}
        navigate={navigate}
        location={location}
        params={params}
        match={{ params }}
        history={{
          push: (to) => navigate(to),
          replace: (to) => navigate(to, { replace: true }),
        }}
      />
    );
  };
}
