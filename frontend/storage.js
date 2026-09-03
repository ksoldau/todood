import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const nativeStorageMethods = {
  save: SecureStore.setItemAsync,
  read: SecureStore.getItemAsync,
  remove: SecureStore.deleteItemAsync,
};

const storageMethods = {
  web: {
    save: AsyncStorage.setItem,
    read: AsyncStorage.getItem,
    remove: AsyncStorage.removeItem,
  },
  ios: nativeStorageMethods,
  android: nativeStorageMethods,
};

export async function save(key, value) {
  const platformSpecificSave = storageMethods[Platform.OS]?.save;
  if (!platformSpecificSave) {
    throw new Error(`Unsupported platform: ${Platform.OS}`);
  }

  return platformSpecificSave(key, value);
}

export async function read(key) {
  const platformSpecificRead = storageMethods[Platform.OS]?.read;
  if (!platformSpecificRead) {
    throw new Error(`Unsupported platform: ${Platform.OS}`);
  }

  return platformSpecificRead(key);
}

export async function remove(key) {
  const platformSpecificRemove = storageMethods[Platform.OS]?.remove;
  if (!platformSpecificRemove) {
    throw new Error(`Unsupported platform: ${Platform.OS}`);
  }

  return platformSpecificRemove(key);
}
