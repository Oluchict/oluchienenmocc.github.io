
let dbPromise = idb.open('currency-converter-db', 1, function (upgradeDb) {
    let store = upgradeDb.createObjectStore('converter-page');
    store.put('', "currencies");
})


const Converter = {
    currencies: {},
    parseCurrencies() {
        // console.log(JSON.parse(Symbol(this.currencies)));
    },
    from: {
        currency: "NGN", 
        amount: "0.0000",
    },
    to: {
        currency: "USD", 
        amount: "0.0000",
    }
}

if(window.navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js');
}

function getCurrencies() {
    let url = 'https://free.currencyconverterapi.com/api/v5/currencies';
    
    dbPromise.then(function (db) {
        let tx = db.transaction('converter-page');
        let keyValStore = tx.objectStore('converter-page');
        return keyValStore.get('currencies');
    }).then((value) => {
        Converter.currencies = value;
        updateCurrecyOptions();
    });
    
    axios.get(url).then(function(response) {
        //success
        // console.log('Your Request was Successful!', response.data.results);
        Converter.currencies = response.data.results;
        updateCurrecyOptions();
    }).catch(function() {
        //error
        console.log('There was an Error when fetching the Currencies. Now loading from IndexDB');
    });
}

function updateCurrecyOptions() {
    let currencies = Object.keys(Converter.currencies);

    dbPromise.then(function(db) {
        let tx = db.transaction('converter-page', 'readwrite');
        let keyValStore = tx.objectStore('converter-page');
        return keyValStore.put(Converter.currencies,'currencies');
    });

    currencies.map(function(currency) {
        //create the <option>
        let option = $('<option>');
        //insert the currency id into the <option>
        option.text(currency).attr('value', currency);
        //append into <select id="from">
        $('select#from, select#to').append(option);
    });
}

function updateToCurrency(value) {
    value = parseFloat(value).toFixed(2);
    Converter.to.amount = value;
    $('input#to').val(value);
}

function convertCurrency(amount, fromCurrency, toCurrency, cb) {

    fromCurrency = encodeURIComponent(fromCurrency);
    toCurrency = encodeURIComponent(toCurrency);

    let query = fromCurrency + '_' + toCurrency;

    let data = {
        compact: 'ultra',
        q: query,
    }

    let url = 'https://free.currencyconverterapi.com/api/v5/convert';
  
    axios.get(url, {params: data}).then(function (res) {
        let val = res.data[query];
        if (val) {
            let total = val * amount;
            updateToCurrency(Math.round(total * 100) / 100);
        } else {
            let err = new Error("Value not found for " + query);
            console.log(err);
        }
    }).catch(function(e) {
        console.log("Got an error: ", e);
    });
}

$("select#from, select#to").on('change', function() {
    let id = $(this).attr('id')
    Converter[id].currency = $(this).val();
});

$("input#from").on('keyup', function() {
    let id = $(this).attr('id')
    Converter[id].amount = $(this).val();
});

$('.convert-btn').click(function() {
    let amount = Converter.from.amount;
    let fromCur = Converter.from.currency;
    let toCur = Converter.to.currency;

    convertCurrency(amount, fromCur, toCur);
});


getCurrencies();
