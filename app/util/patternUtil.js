import React from 'react';

const PatternContext = React.createContext({
  patternDetail: 'someDetail',
  setPatternDetail: () => {},
});

export default PatternContext;
