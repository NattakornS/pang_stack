<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: 'App'
}
</script>
<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@200&display=swap');
#q-app {
  font-family: 'Kanit', sans-serif;
  border-radius: 0px;
  background: #2a3b42;
  box-shadow: inset -35px -35px 70px #243238, 
            inset 35px 35px 70px #61818d;

}
</style>