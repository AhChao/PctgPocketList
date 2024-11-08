import { gen1Cards } from "../gen/1.js";
const app = Vue.createApp({
    created() { },
    data() {
        return {
            cards: {
                "gen1":{
                }
            },
            searchQuery: "",
            oddsTable:[
                { rarity: 'diamond1', odds: [100, 0, 0] },
                { rarity: 'diamond2', odds: [0, 90, 60] },
                { rarity: 'diamond3', odds: [0, 5, 20] },
                { rarity: 'diamond4', odds: [0, 1.666, 6.664] },
                { rarity: 'star1', odds: [0, 2.572, 10.288] },
                { rarity: 'star2', odds: [0, 0.5, 2] },
                { rarity: 'star3', odds: [0, 0.222, 0.888] },
                { rarity: 'crown', odds: [0, 0.04, 0.16] }
            ],
            isDarkMode: false,
        };
    },
    mounted() {
        this.init();
    },
    computed: {
        isSmallScreen() {
            return screen.width < 568;
        },
        filteredCards() {
            const filteredCardsObj = JSON.parse(JSON.stringify(this.cards["gen1"]));
            const obj = {};
            for(const pack of Object.keys(filteredCardsObj)){
                obj[pack] = {};
                Object.keys(filteredCardsObj[pack]).forEach(name => {
                    if (name.includes(this.searchQuery)) {
                        obj[pack][name] = filteredCardsObj[pack][name];
                    }
                });
            }
            return obj;
        },
    },
    methods: {
        init(){
            for(const cards of gen1Cards){
                this.cards.gen1[cards["pack"]] = this.calculateOdds(this.groupByCardName(cards["card"]), cards["card"])
            }
        },
        calculateOdds(cardsWithRarity, cards){
            let count = {};
            for(const rarity of Object.keys(cards)){
                count[rarity] = cards[rarity].length;
            }
            for(const card of Object.keys(cardsWithRarity)){
                cardsWithRarity[card] = this.calculateSingleCardOdds(cardsWithRarity[card], count);
            }
            return cardsWithRarity;
        },
        calculateSingleCardOdds(card, count){
            let arr = [];
            for(const rarity of card){
                let odds = JSON.parse(JSON.stringify(this.oddsTable.filter(x=> x.rarity === rarity)[0].odds));
                odds = odds.map(x => x / count[rarity]);
                if(arr.length == 0){
                    arr = odds;
                }else {
                    arr = [arr[0] + odds[0], arr[1] + odds[1], arr[2] + odds[2]];
                }
            }
            arr = arr.map(x=> x.toFixed(4).replace(/\.0+$/, "")+"%");
            return arr;
        },
        groupByCardName(data) {
            const result = {};
            Object.keys(data).forEach(rarity=>{
                data[rarity].forEach(card=>{
                    if(result.hasOwnProperty(card)){
                        result[card].push(rarity);
                    }else{
                        result[card] = [rarity];
                    }
                });
            });
            return result;
        }
        
    }
});
app.mount('#app');