import fs from 'fs';
import  * as webdriver from 'selenium-webdriver'
import  * as Chrome from 'selenium-webdriver/chrome'



import ParserClass from './class/ParserClass';




const options = new Chrome.Options();

options.addArguments("profile.password_manager_enabled=false");
const By = webdriver.By;
const until = webdriver.until;
const driver = new webdriver.Builder()
    .withCapabilities(options.toCapabilities())
    .build();



const parserClass = new ParserClass(driver, By, until);



fs.readFile('setting.json', (err, data) => {
    if (err) {
        console.error(err);
    }

    if (parserClass.settingDep(data)) {
        parserClass.logInAccount();
        parserClass.searchFollowersViaMyFollowers();
    } else {
        driver.quit()
    }




});