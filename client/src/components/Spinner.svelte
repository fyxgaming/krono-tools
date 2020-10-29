<script lang="ts">
  import { loading } from "../services/stores";
  let visible: string = "none";

  export const isVisible = () => { return visible === 'block'; };

  export const show = () => {
    visible = "block";
  };

  export const hide = () => {
    visible = "none";
  };

  loading.subscribe(val => {
    if (val) {
      show();
    } else {
      hide();
    }
  });
</script>

<style>
  .spinnerRoot {
    position: absolute;
    z-index: 1000;
    width: 100%;
    height: 100%;
    padding: 50% 50% 50% 50%;
    background: repeating-linear-gradient(180deg, transparent 1%, #fafafa 2%),
                repeating-linear-gradient(270deg, transparent 1%, #fafafa 2%);
  }

  .kv-spinner {
    color: official;
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  .kv-spinner div {
    transform-origin: 40px 40px;
    animation: kv-spinner 1.2s linear infinite;
  }
  .kv-spinner div:after {
    content: " ";
    display: block;
    position: absolute;
    top: 3px;
    left: 37px;
    width: 6px;
    height: 18px;
    border-radius: 20%;
    background: #fcf;
  }
  .kv-spinner div:nth-child(1) {
    transform: rotate(0deg);
    animation-delay: -1.1s;
  }
  .kv-spinner div:nth-child(2) {
    transform: rotate(30deg);
    animation-delay: -1s;
  }
  .kv-spinner div:nth-child(3) {
    transform: rotate(60deg);
    animation-delay: -0.9s;
  }
  .kv-spinner div:nth-child(4) {
    transform: rotate(90deg);
    animation-delay: -0.8s;
  }
  .kv-spinner div:nth-child(5) {
    transform: rotate(120deg);
    animation-delay: -0.7s;
  }
  .kv-spinner div:nth-child(6) {
    transform: rotate(150deg);
    animation-delay: -0.6s;
  }
  .kv-spinner div:nth-child(7) {
    transform: rotate(180deg);
    animation-delay: -0.5s;
  }
  .kv-spinner div:nth-child(8) {
    transform: rotate(210deg);
    animation-delay: -0.4s;
  }
  .kv-spinner div:nth-child(9) {
    transform: rotate(240deg);
    animation-delay: -0.3s;
  }
  .kv-spinner div:nth-child(10) {
    transform: rotate(270deg);
    animation-delay: -0.2s;
  }
  .kv-spinner div:nth-child(11) {
    transform: rotate(300deg);
    animation-delay: -0.1s;
  }
  .kv-spinner div:nth-child(12) {
    transform: rotate(330deg);
    animation-delay: 0s;
  }
  @keyframes kv-spinner {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
</style>

<div style="display:{visible}" class="spinnerRoot">
  <div class="kv-spinner">
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
  </div>
</div>
