let newPasswordValue;
let confirmationValue;
const form = document.getElementById('update-account');
const newPassword = document.getElementById('new-password');
const confirmation = document.getElementById('confirm-password');
const validationMessage = document.getElementById('validation-message');
function validatePasswords(message, add, remove){
    validationMessage.textContent = message;
    validationMessage.classList.add(add);
    validationMessage.classList.remove(remove);
};
confirmation.addEventListener('input', e =>{
    e.preventDefault();
    newPasswordValue = newPassword.value;
    confirmationValue = confirmation.value;
    if(newPasswordValue !== confirmationValue){
        validatePasswords('Passwords Must Match!', 'color-red', 'color-green' );
    }else{
        validatePasswords('Passwords Match!', 'color-green', 'color-red' );
    }
});

