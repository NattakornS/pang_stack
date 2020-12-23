'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const tf = require("@tensorflow/tfjs-node");
module.exports = {
    
    async predict(ctx) {
        // const model = await tf.node.loadSavedModel("/srv/model/");
        // let result = model.predict([2,4,1,1,175000.0,97,47,10000.0])
        // if (result) {
        //     return result
        // }
        return 'Predict!';
    },
};
