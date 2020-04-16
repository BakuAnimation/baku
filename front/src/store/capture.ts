import { Device } from '@/api/device.class';
import { BakuModule, CaptureState } from '@/store/store.types';

export const CaptureStore: BakuModule<CaptureState> = {
  namespaced: true,
  state: {
    stream: null,
    activeDevice: null,
    activeCapture: false,
    scaleX: 1,
    scaleY: 1,
    onionSkin: 0,
  },
  mutations: {
    attachMediaStream(state, stream: MediaStream) {
      state.stream = stream;
    },
    detachMediaStream(state) {
      if (state.stream) {
        state.stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      state.stream = null;
    },
    setActiveCapture(state, activeCapture: boolean) {
      state.activeCapture = activeCapture;
    },
    setDevice(state, device: Device | null) {
      state.activeDevice = device;
    },
    toggleScaleX(state) {
      state.scaleX *= -1;
    },
    toggleScaleY(state) {
      state.scaleY *= -1;
    },
    setOnionSkin(state, val: number){
      state.onionSkin = val;
    }
  },
  actions: {
    selectDevice(context, device: Device | null) {
      context.commit('setDevice', device);
    },

    setActiveCapture(context, activeCapture: boolean) {
      context.commit('setActiveCapture', activeCapture);
      if (!activeCapture) {
        context.commit('detachMediaStream');
      }
    },

    toggleScaleX(context) {
      context.commit('toggleScaleX');
    },

    toggleScaleY(context) {
      context.commit('toggleScaleY');
    },

    setOnionSkin(context, val: number) {
      context.commit('setOnionSkin', val);
    }
  },
  getters: {
  },
  modules: {},
};
