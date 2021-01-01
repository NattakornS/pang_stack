<template>
  <div id="app">
    <Tinder ref="tinder" :queue.sync="queue">
      <template slot-scope="{ data }">
        <!-- <div
          class="pic"
          :style="`background-image:url(${data.key})`"
        ></div> -->
        <q-card @click="openlink(data)" class="full-height">
          <img :src="data.key">
  
          <q-card-section>
            <div class="text-h6">{{data.name}}</div>
            <div class="text-subtitle2">{{data.desc}}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <vue-markdown-it
              v-if="data.detail"
              :source="data.detail"
              id="editor"
            />
          </q-card-section>
        </q-card>
      </template>
      <img
        class="like-pointer"
        slot="like"
        src="https://johnnydan.oss-cn-beijing.aliyuncs.com/vue-tinder/like-txt.png"
      />
      <img
        class="nope-pointer"
        slot="nope"
        src="https://johnnydan.oss-cn-beijing.aliyuncs.com/vue-tinder/nope-txt.png"
      />
      <img
        class="super-pointer"
        slot="super"
        src="https://johnnydan.oss-cn-beijing.aliyuncs.com/vue-tinder/super-txt.png"
      />
    </Tinder>
    <div class="btns">
      <img
        src="https://johnnydan.oss-cn-beijing.aliyuncs.com/vue-tinder/nope.png"
        @click="decide('nope')"
      />
      <img
        src="https://johnnydan.oss-cn-beijing.aliyuncs.com/vue-tinder/super-like.png"
        @click="decide('super')"
      />
      <img
        src="https://johnnydan.oss-cn-beijing.aliyuncs.com/vue-tinder/like.png"
        @click="decide('like')"
      />
    </div>
  </div>
</template>

<script>
import Tinder from "vue-tinder";
import VueMarkdownIt from "vue-markdown-it";
export default {
  name: 'CardRecomend',
  components: {
    Tinder,
    VueMarkdownIt
  },
  data: () => ({
    cards: [],
    queue: [],
    demos:[],
    orderCard: []
  }),
  created() {
    // this.getData();
  },
  mounted() {
    this.getCards();
    // this.getCustomers();
    this.orderSubmission();
  },
  methods: {
    async orderSubmission() {
      let result = await this.$axios.get(process.env.API+'submissions/'+this.$route.params.id)
      console.log(result);
      if (result.data) {
        let orderCard = []
        const sortable = Object.entries(result.data).sort((a, b) => b[1]-a[1]);
        console.log('test : ',result.data,sortable);
        for (const el of sortable) {
          // console.log(`${key}: ${value}`);
          if(el[0].includes('class')){
            let index = parseInt(el[0].replace('class',''))
            console.log(this.cards[index]);
            orderCard.push(this.cards[index]) 
          }
        }
        // console.log("test ; ",this.orderCard);
        this.queue = [...orderCard]
        console.log(this.queue);
        // this.demos = result.data
      }
    },
    async getCustomers() {
      let result = await this.$axios.get(process.env.API+'demographics')
      console.log(result);
      if (result.data) {
        this.demos = result.data
      }
    },
    openlink(data) {
      window.open(data.link, '_blank');
    },
    async getCards() {
      let result = await this.$axios.get(process.env.API+'card-infos')
      if (result.data) {
        this.queue = []
        this.cards = []
        for (let i = 0; i < result.data.length; i++) {
          let item = {...result.data[i]}
          item['key'] = item.external_img
          this.queue.push(item)
          this.cards.push(item)
        }       
        // this.cards = [...this.queue]
        // console.log(this.queue); 
      }
    },
    /**
     * 用于产生demo用的数据
     * @method getData
     */
    getData() {
      const list = [];
      for (let i = 0; i < 5; i++) {
        list.push({
          key: Math.random(),
        });
      }
      this.queue = this.queue.concat(list);
    },
    /**
     * 点击按钮所绑定的方法，此方法为调用vue-tinder组件内方法的示例，仅供参考
     * @method submit
     * @param  {String} choice
     */
    decide(choice) {
      this.$refs.tinder.decide(choice);
    },
    /**
     * 自定义事件submit绑定的方法，移除卡片的回调
     * @method submit
     * @param  {Object} choice {type,key}
     */
    submit(choice) {
      switch (choice) {
        case 'nope': // 左滑
          break;
        case 'like': // 右滑
          break;
        case 'super': // 上滑
          break;
      }
      if (this.queue.length < 2) {
        this.getData();
      }
    }
  },
};
</script>

<style lang="scss" scoped>
/* 此样式可能仅适用本demo，仅供参考，可根据具体设计稿或喜好自定义 */
html,
body {
  height: 100%;
}

body {
  background: #20262e;
  overflow: hidden;
}

/* 直接script引用建议增加，不然会引发闪烁，单文件组件不需要 */
[v-cloak] {
  display: none;
}

/* 注意！组件的宽高必须设置，不然出不来！！！ */
#app .vue-tinder {
  position: absolute;
  z-index: 1;
  left: 0;
  right: 0;
  top: 23px;
  margin: auto;
  width: calc(100% - 20px);
  height: calc(100% - 23px - 18%);
  min-width: 300px;
  max-width: 355px;
}

/* 卡片内的3种状态指示器位置，透明度会由组件自动调整 */
.nope-pointer {
  right: 10px;
}
.like-pointer {
  left: 10px;
}
.nope-pointer,
.like-pointer {
  position: absolute;
  z-index: 1;
  top: 20px;
  width: 64px;
  height: 64px;
}
.super-pointer {
  position: absolute;
  z-index: 1;
  bottom: 80px;
  left: 0;
  right: 0;
  margin: auto;
  width: 112px;
  height: 78px;
}

/* slot内图片样式 */
.pic {
  width: 100%;
  height: 100%;
  background-size: cover;
}

/* 按钮样式 */
.btns {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  height: 18%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 300px;
  max-width: 355px;
}
.btns img {
  width: 80px;
}
</style>
