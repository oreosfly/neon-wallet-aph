import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import { getAccountsFromWIFKey, generatePrivateKey, getWIFFromPrivateKey } from '../wallet/index.js';
import * as types from '../actions/types';

// reducer for state used when performing a transaction
const transactionState = (state = {success: null, message: null, selectedAsset: 'NEO'}, action) => {
  switch (action.type) {
      case types.SEND_TRANSACTION:
          return {...state, success:action.success, message: action.message};
      case types.CLEAR_TRANSACTION:
          return {...state, success: null, message: null};
      case types.TOGGLE_ASSET:
          let asset;
          if (state.selectedAsset == "NEO"){
            asset = "GAS";
          } else {
            asset = "NEO";
          }
          return {...state, success: null, selectedAsset: asset};
      default:
          return state;
  }
};

// reducer used for state necessary to generating a wallet
const generateWallet = (state = {wif: null, address:null}, action) => {
    switch (action.type) {
        case types.NEW_WALLET:
            const newPrivateKey = generatePrivateKey();
            const newWif = getWIFFromPrivateKey(newPrivateKey);
            const loadAccount = getAccountsFromWIFKey(newWif);
            return {...state, wif:newWif, address:loadAccount[0].address};
        default:
            return state;
    }
};

// reducer that manages account state (account now = private key)
const account = (state = {wif: null, address:null, loggedIn: false}, action) => {
    switch (action.type) {
        case types.LOGIN:
            let loadAccount;
            try {
              loadAccount = getAccountsFromWIFKey(action.wif)[0];
            }
            catch (e){ loadAccount = -1; }
            if(loadAccount === -1 || loadAccount === -2 || loadAccount === undefined){
              return {...state, wif:action.wif,  loggedIn:false};
            }
            return {...state, wif:action.wif, address:loadAccount.address, loggedIn:true};
        case types.LOGOUT:
            return {'wif': null, address: null, 'loggedIn': false};
        default:
            return state;
    }
};

// reducer for metadata associated with Neon
const metadata = (state = {blockHeight: 0, net: 'TestNet'}, action) => {
  switch (action.type) {
    case types.SET_HEIGHT:
      return { blockHeight: action.blockHeight };
    case types.SET_NETWORK:
        return {...state, net:action.net};
    default:
      return state;
  }
};


// reducer for wallet account balance
const wallet = (state = {ANS: 0, ANC: 0, transactions: [], price: '--', claimAmount: 0, claimAvailable: 0, claimUnavailable: 0, claimRequest: false, claimWasUpdated: false, disableClaimButton: false}, action) => {
    switch (action.type) {
        case types.SET_BALANCE:
            let ansValue, ancValue;
            if (action.ANS !== undefined){
              ansValue = action.ANS;
            } else {
              ansValue = 0;
            }
            if (action.ANC !== undefined){
              ancValue = action.ANC;
            } else {
              ancValue = 0;
            }
            return {...state, 'ANS': ansValue, 'ANC': ancValue, 'price': action.price };
        case types.RESET_PRICE:
            return {...state, 'price': '--'};
        case types.SET_CLAIM:
          console.log(action);
            let claimWasUpdated = false;
            if (action.available > state.claimAvailable){
              claimWasUpdated = true;
            }
            return {...state, 'claimAmount': (action.available + action.unavailable) / 100000000, 'claimAvailable': action.available, 'claimUnavailable': action.unavailable, claimWasUpdated};
        case types.SET_CLAIM_REQUEST:
            return {...state, 'claimRequest': action.status};
        case types.DISABLE_CLAIM:
            return {...state, disableClaimButton: action.status};
        case types.SET_MARKET_PRICE:  //current market price action type
            let currentPrice;
            if (action.price !== undefined){
                currentPrice = action.price;
            } else {
                currentPrice = '--';
            }
            return {...state, price: currentPrice};
        case types.SET_TRANSACTION_HISTORY:
            return {...state, transactions: action.transactions};
        default:
            return state;
    }
};

// reducer for UI state
const dashboard = (state = {sendPane: true, confirmPane: true}, action) => {
  switch (action.type) {
      case types.TOGGLE_SEND_PANE:
          let newState = {};
          newState[action.pane] = !state[action.pane];
          return {...state, ...newState };
      default:
          return state;
  }
};

const rootReducer = combineReducers({
    account,
    generateWallet,
    wallet,
    transactionState,
    dashboard,
    metadata
});

export default rootReducer;
