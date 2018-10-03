// src/index.ts
import './assets/styles/main.scss';

import Vue from "vue";
// If using .ts
import HelloComponent from "./Hello";
// If using .vue
import HelloSingleFileComponent from "./Hello.vue";

let v = new Vue({
    el: "#app",
    template: `
    <div>
        Name: <input v-model="name" type="text">
        <hello-component :name="name" :initialEnthusiasm="5" />
        <HelloSingleFileComponent :name="name" :initialEnthusiasm="5" />
    </div>
    `,
    data: { name: "Hiren" },
    components: {
        HelloComponent,
        HelloSingleFileComponent
    }
});
