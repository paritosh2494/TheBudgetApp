//Budget Controller
var budgetController = (function(){

    var Expense = function (id ,description ,value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0){
            this.percentage = ((this.value / totalIncome ) * 100).toFixed(2);
        } else {
            this.percentage = -1;
        }        
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage
    }

    var Income = function (id ,description ,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItem[type].forEach(function(current , index , array){
            sum += current.value;
        });
        data.totals[type] = sum ;
    };

    var data = {
        allItem: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percetage: -1
    };
    return {
        deleteItem: function(type , id) {

            var ids, index;

            ids =  data.allItem[type].map(function(current){

                return current.id;

            });

            index = ids.indexOf(id);
            if(index !== -1) {
                data.allItem[type].splice(index,1);
            }
        },

        addItem: function(typ, des, val) {
            var newItem , ID;

            //Create New ID
            console.log(data.allItem[typ].length);
            if(data.allItem[typ].length === 0) {
                ID = 0;
            } else {
                ID = data.allItem[typ][data.allItem[typ].length - 1].id + 1;
            }
            

            //Create New Item
            if(typ === 'exp') {
                newItem =  new Expense(ID, des, val);
            } else if (typ === 'inc') {
                newItem = new Income(ID ,des ,val);
            }

            //Push Item to data structure
            data.allItem[typ].push(newItem);

            //Return the element
            return newItem;
        },
        calcBudget: function() {
            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');


            //Calculate the budget: income - expences

            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage of the income that we spent
            if(data.totals.inc > 0) {
                data.percetage = ((data.totals.exp / data.totals.inc ) * 100).toFixed(2);
            } else {
                data.percetage = -1;
            }

        },
        calculatePercentage: function() {
            data.allItem.exp.forEach(function(current, index ,array){
                current.calcPercentage(data.totals.inc);
            });
        },
        getPercent: function() {
            var percentageArray;

            percentageArray = data.allItem.exp.map(function(current, index ,array){
                return current.getPercentage();
            });
            return percentageArray;
        },
        getBudget: function() {
            return {
            budget: data.budget,
            totalinc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percetage
            }
        },
        testing: function() {
            console.log(data);
        }
    }
})();

//UI Controller
var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetValue: '.budget__value',
        budgetIncomeValue: '.budget__income--value',
        budgetExpenseValue: '.budget__expenses--value',
        budgetExpensePercentage: '.budget__expenses--percentage',
        budgetMonth: '.budget__title--month',
        container: '.container',
        ExpencePercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num , type) {
        var intArray = [];
        num = Math.abs(num);
        num = num.toFixed(2);
        
        numSplit = num.split('.');
        
        int = numSplit[0].toString();

        while(int.length > 3){
            var numel = int.substr(int.length - 3, 3);
            intArray.unshift(numel);
            int = int.substr(0,int.length - 3);
        }
        intArray.unshift(int);
        int = intArray.toString();

        dec = numSplit[1]; 

        return (type === 'exp'? '-' : '+') + ' ' + int + '.' + dec;    
    };
    var nodeListForEach = function(list , updateFunction){
        for (var i = 0 ; i< list.length ; i++){
            updateFunction(list[i],i);
        }
    };

    return {
        getinput: function() {
            return{
                type: document.querySelector(DOMstrings.inputType).value, // inc +, exp -
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        addListItem: function(obj , type) {

            var html ,newhtml , element;
            //Create HTML string with placeholder text
            if ( type === 'inc') {
                element =  DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix">' + 
                            '<div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn">' + 
                            '<i class="ion-ios-close-outline"> </i></button></div></div></div>';
            } else if ( type === 'exp') {        
                element = DOMstrings.expenseContainer;    
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div>' + 
                            '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percent%</div>' +
                            '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                            '</div></div></div>';
            }
            

            //Replace the placeholder text with some actual data

            newhtml = html.replace('%id%',obj.id);
            newhtml = newhtml.replace('%description%',obj.description);
            newhtml = newhtml.replace('%value%',formatNumber(obj.value , type));

            //insert the HTML into DOM

            document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);
        },
        deleteListItem: function(selectorID){

            var element = document.getElementById(selectorID);

            element.parentNode.removeChild(element);

        },
        clearFields: function() {
            var fieldsList, fieldArray;
            fieldsList = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldArray = Array.prototype.slice.call(fieldsList);

            fieldArray.forEach(function(current , index , array){
                current.value = "";
            });
            fieldArray[0].focus(); 
        },
        setBudget: function(inc , exp , budget , percent) {
            console.log(budget,inc,exp,percent);
            var type = budget >= 0 ? 'inc' : 'exp';
            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(budget,type);
            document.querySelector(DOMstrings.budgetIncomeValue).textContent =  formatNumber(inc , 'inc');
            document.querySelector(DOMstrings.budgetExpenseValue).textContent =  formatNumber(exp , 'exp');
            if(percent !== -1) {
                document.querySelector(DOMstrings.budgetExpensePercentage).textContent = percent + '%';
            } else {
                document.querySelector(DOMstrings.budgetExpensePercentage).textContent = '---';
            }    
        },
        displayPercent: function(percentArray) {
            var fields = document.querySelectorAll(DOMstrings.ExpencePercentage);

            nodeListForEach(fields, function(current , index){
                if(percentArray[index] > 0) {
                    current.textContent = percentArray[index] + '%';
                } else {
                    current.textContent = '---'
                }
            });
        },
        displayMonth: function(){
            var now, year, month, months;
            now = new Date();

            months = ['January','Febuary','March','April','May','June','July','August','September','October','November','December'];

            year = now.getFullYear();

            month = now.getMonth();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changeType: function(){

            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputValue + ',' +DOMstrings.inputDescription);

            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');


        },
        getDOMstrings: function() {
            return DOMstrings;
        }    
    }
})();

//Global App Controller

var controller = (function(budgetctrl, UICtrl) {

    var DOM = UICtrl.getDOMstrings();

    var setUpEventListner = function (){

        document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress',function(event) {
            // console.log(event);
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);
    };

    var updatePercentage = function() {

        //Calculate Percentage
        budgetctrl.calculatePercentage();

        //get Percentage
        var percentArray = budgetctrl.getPercent();

        //console.log(percentArray);
        //display Percentage
        UICtrl.displayPercent(percentArray);
        

    }

    var updateBudget = function() {
            
        //Calculate Budget
        budgetctrl.calcBudget();

        //Method that will return a Budget
        var budget = budgetctrl.getBudget();

        //Display the Budget in UI 
        UICtrl.setBudget(budget.totalinc, budget.totalExp , budget.budget , budget.percentage);

    };

    var ctrlAddItem = function() {
            
        //Get the field input data
        var input = UICtrl.getinput();
        console.log(input);

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //Add the input to the budget controller
            var newItem = budgetctrl.addItem( input.type , input.description , input.value);

            //Add the new item to UI
            UICtrl.addListItem(newItem , input.type);

            //Clearing Fields
            UICtrl.clearFields();

            //Calulate and Update budget
            updateBudget();   

            //Update and Calculate Percentage
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID , id , type;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        itemArray = itemID.split('-');

        type = itemArray[0];
        id = parseInt(itemArray[1]);

        //Delete the item from Data Structure
        budgetctrl.deleteItem(type,id);

        //Delete the item from HTML
        UICtrl.deleteListItem(itemID);

        //Update Budget
        updateBudget();

        //Update and Calculate Percentage
        updatePercentage();
    }

    return {
        init: function() {
            console.log('Application Started');
            UICtrl.displayMonth();
            UICtrl.setBudget(0, 0 , 0 , -1);
            setUpEventListner();
        }
    }
})(budgetController,UIController);

controller.init();




