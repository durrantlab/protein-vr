var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./ActionParent"], function (require, exports, ActionParent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AdministerQuiz = (function (_super) {
        __extends(AdministerQuiz, _super);
        function AdministerQuiz(params) {
            return _super.call(this, params) || this;
        }
        AdministerQuiz.prototype.do = function () {
            var quiz = this.parameters["quiz"];
            console.log(quiz);
            console.log(quiz.name);
            var takeQuiz = confirm('Would you like to take ' + quiz.name + '?');
            if (!takeQuiz) {
                alert('Your loss!');
                return;
            }
            for (var key in quiz.questions) {
                var response = prompt(quiz.questions[key].question + "\nYour options are: " +
                    "\n" + quiz.questions[key].option1 + "\n" + quiz.questions[key].option2 + "\n" +
                    quiz.questions[key].option3 + "\n" + quiz.questions[key].option4, "I have no idea >:(");
                if (response == quiz.questions[key].answer) {
                    var proceed = confirm("Correct! Ready for the next question?");
                    if (!proceed) {
                        break;
                    }
                }
                else {
                    var proceed = confirm("Oof! Actually, the correct answer was " + quiz.questions[key].answer +
                        ". Would you like to move on to the next question?");
                    if (!proceed) {
                        break;
                    }
                }
            }
            alert("Thanks for taking our quiz! You're doing great!");
        };
        return AdministerQuiz;
    }(ActionParent_1.default));
    exports.default = AdministerQuiz;
});
