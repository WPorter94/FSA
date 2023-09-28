class FSA {
  constructor(){
    class State{
      constructor(name){
        let stateName = name;
        let transition = [];

        // Method to get the state name
        this.getName = () => {
          return stateName;
        }
        // Method to set the state name
        this.setName = (s) => {
          stateName = s;
          return this;
        }
        // Method to add a transition to the state
        this.addTransition = (e, s) => {
          if(lib220.getProperty(transition,e).found === true){
            lib220.setProperty(transition,e,s);
          } else {
            let nT = {};
            lib220.setProperty(nT,e,s);
            transition.push(nT);
          }
          return this;
        }
        // Method to get the transitions of the state
        this.getTransition = () => {
          return transition;
        }
        // Method to set the transitions of the state
        this.setTransition = (t) => {
          transition = t;
          return this;
        }
        // Method to get the next state based on an event
        this.nextState = (e) => {
          if(lib220.getProperty(transition.filter(x => lib220.getProperty(x, e).found === true)[0],e).found === true){
            return lib220.getProperty(transition.filter(x => lib220.getProperty(x, e).found === true)[0],e).value;
          }
          console.log("event not linked to current state: " + this.getName());
          return this;
        }
        // Method to get next states based on an event
        this.nextStates = (e) => {
          if(lib220.getProperty(transition,e).found === true){
            return lib220.getProperty(transition,e).value.transition;
          }
          console.log("event not linked to current state: " + this.getName());
          return this;
        }
      }
    }

    // Memento class for storing and restoring states
    class Memento{
      constructor(){
        let stored = undefined;

        // Method to store a state in the memento
        this.storeState = (s) => {
          stored = s;
        }
        // Method to get the stored state from the memento
        this.getState = () => {
          return stored;
        }
      }
    }

    // Initialize variables to track the current state and all states
    let currentState = undefined;
    let allStates = [];

    // Method to transition to the next state based on an event
    this.nextState = (e) => {
      if(allStates.filter(x => x.getName() === currentState.nextState(e)).length > 0){
        currentState = allStates.filter(x => x.getName() === currentState.nextState(e))[0];
      }
      return this;
    }
    // Method to create a new state
    this.createState = (s,transitions) => {
      let nS = new State(s);
      nS.setTransition(transitions);
      allStates.push(nS);
      if(currentState === undefined){
        currentState = nS;
      }  
      return this;
    }
    // Method to add a transition to an existing state
    this.addTransition = (s,t) => {
      if(allStates.length > 0)
      {
        if(allStates.filter(x => s === x.getName()).length > 0){
          allStates.filter(x => s === x.getName())[0].addTransition(Object.keys(t)[0],lib220.getProperty(t,Object.keys(t)[0]).value);
        } else {
          let nS = new State(s);
          nS.setTransition(t);
          allStates.push(nS);
        }
      } else {
        console.log("Cannot add transition to state that doesn't exist");
      }
      return this;
    }
    // Method to show the current state
    this.showState = () => {
      if(currentState === undefined){
        console.log("Current state is undefined");
      } else {
        return currentState.getName();
      }
    }
    // Method to rename a state
    this.renameState = (name, newName) => {
      if(allStates.filter( x => x.getName() === name).length > 0){
        allStates.filter( x => x.getName() === name)[0].setName(newName);
        allStates.map(x => x.getTransition().map(function(y){
          let key = Object.keys(y)[0];
          let val = Object.values(y).map(function(z){
            if(z === name){ z = newName; }
            return z;
          });
          lib220.setProperty(y,key,val[0]);
          return y;
        }));
      } else {
        console.log("Cannot rename state that doesn't exist");
      }
      return this;
    }
    // Method to create a memento representing the current state
    this.createMemento = () => {
      const newMem = new Memento();
      if(currentState !== undefined){
        newMem.storeState(currentState.getName());
      }
      return newMem;
    }
    // Method to restore the machine's state from a memento
    this.restoreMemento = (m) => {
      const stateToRestore = allStates.find(x => x.getName() === m.getState());
      if(stateToRestore){
        currentState = stateToRestore;
      }
      return this;
    }
  }
}

let myMachine = new FSA().createState("delicates, low", [{mode: "normal, low"}]).createState("normal, low", [{mode: "delicates, low"}, {temp: "normal, medium"}]).createState("delicates, medium", [{mode: "normal, medium"},{temp: "delicates, low"}]).createState("normal, medium", [{mode: "delicates, medium"}, {temp: "normal, high"}]).createState("normal, high", [{mode: "delicates, medium"},{temp: "normal, low"}]);
//myMachine.addTransition("high", {temp: "yup"});
myMachine.nextState("mode");
//myMachine.renameState("high", "2");
console.log(myMachine.showState());
console.log("Hey");
myMachine.nextState("temp") // moves the machine to delicates, medium
.nextState("mode") // moves the machine to normal, medium
.nextState("temp"); // moves the machine to normal, high
let restoreTo = myMachine.createMemento(); // creates memento from current state
console.log(restoreTo);
console.log(restoreTo.getState()); // prints name of state in memento
myMachine.nextState("mode") // moves the machine to delicates, medium
.nextState("temp") // moves the machine to delicates, low
.restoreMemento(restoreTo); // restores the machine to normal, hig
console.log(myMachine.showState());

// Unit tests using the Mocha testing framework
const assert = require('assert');

describe('FSA', () => {
  it('should create a new FSA instance', () => {
    const machine = new FSA();
    assert.ok(machine);
  });

  it('should create a new state and show its name', () => {
    const machine = new FSA();
    machine.createState("state1", []);
    assert.strictEqual(machine.showState(), "state1");
  });

  it('should add a transition to an existing state', () => {
    const machine = new FSA();
    machine.createState("state1", []);
    machine.addTransition("state1", { event1: "state2" });
    assert.strictEqual(machine.showState(), "state1");
    machine.nextState("event1");
    assert.strictEqual(machine.showState(), "state2");
  });

});

