import parent from "./ActionParent";

interface QuizInterface{
    quiz: Object;
    length: number;
}

class AdministerQuiz extends parent {
    constructor(params: QuizInterface){
        super(params);
    }

    public do(){
        let quiz = this.parameters["quiz"];

        console.log(quiz);
        console.log(quiz.name);
        let takeQuiz = confirm('Would you like to take ' + quiz.name + '?');

        if (!takeQuiz) {
            alert('Your loss!');
            return;
        }

        for (var key in quiz.questions){
           let response = prompt(quiz.questions[key].question + "\nYour options are: " +
           "\n" + quiz.questions[key].option1 + "\n" + quiz.questions[key].option2 + "\n" +
           quiz.questions[key].option3 + "\n" + quiz.questions[key].option4, "I have no idea >:(");
           if(response == quiz.questions[key].answer){
               let proceed = confirm("Correct! Ready for the next question?");
               if (!proceed) {
                    break;
               }
           }
           else {
                let proceed = confirm("Oof! Actually, the correct answer was " + quiz.questions[key].answer + 
                ". Would you like to move on to the next question?");

                if(!proceed){
                    break;
                }
           }
        }
        alert("Thanks for taking our quiz! You're doing great!");
    }
}

export default AdministerQuiz;