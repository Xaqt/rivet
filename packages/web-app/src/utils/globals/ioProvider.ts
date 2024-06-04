import { BrowserIOProvider } from '../../io/BrowserIOProvider.js';
import { type IOProvider } from '../../io/IOProvider.js';
import { RemoteIOProvider } from '../../io/RemoteIOProvider';

let ioProvider: IOProvider;

if (BrowserIOProvider.isSupported()) {
  ioProvider = new BrowserIOProvider();
} else {
  ioProvider = new RemoteIOProvider();
}

export { ioProvider };
