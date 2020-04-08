// Bare-Bone Implementation Of Promise (pledge) and Fetch (get)
// Author: Devv_Li
// Twitter: @Devv_Li
// Date: Jan/2/2020

// Require the only dependency we will be using.
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
// initialize an instance of XMLHttpRequest.
var xhr = new XMLHttpRequest();

// 1: Create a class using a constructor function
// 2: Pass only one parameter to it (executor)
function Pledge(executor) {
  // executor — A callback used to initialize the Pledge. 
  // This callback is passed two arguments: a resolver callback used to resolve the pledge with a value or the result of another pledge, 
  // And a rejector callback used to reject the pledge with a provided reason or error.
  // The two function must be bound to this class.
  executor(resolver.bind(this), rejector.bind(this));

  // Construct class properties and give them default values.
  this.status = "pending";
  this.value = undefined;
  this.thenChain = [];
  this.catchCB = undefined;
  this.finallyCB = undefined;

  // Make sure to return this in methods to enable chaining.
  this.then = (callback) => {
    this.thenChain.push(callback);
    return this;
  };

  this.catch = (callback) => {
    this.catchCB = callback;
    return this;
  };

  this.finally = (callback) => {
    this.finallyCB = callback;
    return this;
  };

  // ------------------------------------------------------------------------
  // Here i created an array method
  // The method is used within resolver function
  // Practically this method is my implementation of the JS ES6 array reduce method
  Array.prototype.parser = function (callback, initialVal) {
    var returnVal = initialVal === undefined ? undefined : initialVal;
    for (var i = 0; i < this.length; i++) {
      if (returnVal !== undefined) {
        returnVal = callback.call(undefined, returnVal, this[i], i, this);
      } else returnVal = this[i];
    }
    return returnVal;
  };

  // If the Pledge was successfull the resolver function will be called
  function resolver(value) {
    // It updates the class properties with approprite values.
    this.status = "resolved";
    this.value = value;
    // Here it calls my array method parser 
    // Parser takes in a function and an initial value
    // The initial value will be used to run the first function in the thenChain array
    // After which the value returned will be passed down to the next function.
    // So that all our .then will be ran accordingly
    this.thenChain.parser(function (returnVal, func) {
      let value = func(returnVal);
      return value;
    }, this.value);

    // After the .then's has completed execution .finally will ran next
    if (typeof this.finallyCB === "function") {
      this.finallyCB(this.value);
    }
  }

  // Finally If the Pledge was Unsuccessfull the rejector function will be called
  function rejector(value) {
    // It updates the class properties with approprite values.
    this.status = "rejected";
    this.value = value;

    // It checks if the value of the propert catchCb is of type function
    // Next it calls the function if true
    if (typeof this.catchCB === "function") {
      this.catchCB(this.value);
    }

    // After the .catch has completed execution as usual .finally will ran next
    if (typeof this.finallyCB === "function") {
      this.finallyCB();
    }
  }
}

// Now we are going to test the Pledge while implementing fetch
function get(url) {
  return new Pledge(function (resolve, reject) {
    // The xhr open method open connection with method Get and the url we need to get information from.
    xhr.open("GET", url);

    // The onload method takes in the function that should be executed after the request has be made.
    xhr.onload = function () {
      // Checks if the request was successfull After which it resolves else it rejects
      if (xhr.status === 200) {
        resolve(xhr.responseText);
      } else {
        reject(xhr.status);
      }
    }
    // The xhr method send, sends the request to the server
    xhr.send();
  });
}

// Testing time
get("https://jsonplaceholder.typicode.com/todos/1")
  .then((res) => {
    console.log(res);
    
    return JSON.stringify(res)
  })
  .then((res) => console.log(res))
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    console.log("Do Somthing After Pledge Is Settled");
  });
