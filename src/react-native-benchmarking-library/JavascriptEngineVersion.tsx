import React from 'react';
import { Text } from 'react-native';

export const JavaScriptEngineVersion: React.FC = () => {
  if (isHermes()) {
    return <Text testID="EngineVersion">Using Hermes</Text>;
  }
  return <Text testID="EngineVersion">Using JavaScriptCore</Text>;
};

const isHermes = () =>
  !!(global as unknown as { HermesInternal: null | object }).HermesInternal;
