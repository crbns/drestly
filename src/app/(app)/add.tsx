import { Redirect, router } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

const Add = () => {
  return <Redirect href={'/add-item'} />;
};

export default Add;
