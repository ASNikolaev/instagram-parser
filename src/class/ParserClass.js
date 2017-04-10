function nospace(str) {
    let VRegExp = new RegExp(/^(\s|\u00A0)+/g),
        VResult = str.replace(VRegExp, '');
    return VResult
}

function randomInteger(min=1, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}


class ParserClass {

    constructor(driver, By, until) {
        this.steps = [];
        this.countADD = 0;
        this.pageSt = false;
        this.driver = driver;
        this.By = By;
        this.until = until;
    }

    callFunction () {
        if (this.countADD <= this.setting.maxCountAddUsers) {
            this.searchFollowersViaMyFollowers()
        } else {
            this.driver.quit()
        }
    }

    settingDep(file) {
        let fileSetting = JSON.parse(file);
        if (nospace(fileSetting.UserName) === "" ||
            nospace(fileSetting.password) === "" ) {
            return false
        }
        this.UserName = fileSetting.UserName;
        this.password = fileSetting.password;
        this.setting = fileSetting.setting;
        return true
    }

    logInAccount() {
        this.driver.get('https://www.instagram.com/accounts/login/');
        this.driver.wait(this.until.titleIs('Вход • Instagram'), 1000);
        this.driver.findElement(this.By.name('username')).sendKeys(this.UserName);
        this.driver.findElement(this.By.name('password')).sendKeys(this.password);
        this.driver.findElement(this.By.xpath('//button')).click();
        this.driver.sleep(5000);
        this.driver.findElement(this.By.className("_q90d5"))
            .then(res => {
                console.log('password incorrect');
                this.driver.quit()
            })
            .catch(err => {
                this.driver.findElement(this.By.xpath("//div[@class='_pq5am']/div[3]/a")).click();
            });
    }

    searchFollowersViaMyFollowers () {
        if (this.countADD >= this.setting.maxCountAddUsers) {
            this.driver.quit();
        }
        let prom = this.driver.findElement(this.By.className("_glq0k"))
            .then((res) => {
                let users = (this.steps.length === 0) ?
                    `https://www.instagram.com/${this.UserName}/` : this.steps[randomInteger(0, this.steps.length-1)];
                this.driver.get(users)

            })
            .catch((err) => {
                let followPath = "//div[@class='_de9bg']/ul/li[3]/a";
                this.driver.wait(this.until.elementLocated(this.By.xpath("//div[@class='_de9bg']")));
                this.driver.findElement(this.By.xpath(followPath)).click();
                this.driver.wait(this.until.elementLocated(this.By.xpath("//li[@class='_cx1ua']")));


                this.driver.findElements(this.By.className("_cx1ua")).then((elements) => {
                    let RandomUsers = randomInteger(1, elements.length);
                    this.goOnPageUsers(RandomUsers)

                });


                this.driver.findElement(this.By.className('_84y62'))
                    .then((res) => {
                        this.checkPage();
                    })
                    .catch((err) => {});

                this.driver.findElement(this.By.xpath("//div[@class='_8mm5v']/h1")).getText().then((name) => {
                    this.steps.push(`https://www.instagram.com/${name}/`)
                });
            });



        Promise.all([prom]).then((res) => {
            this.driver.sleep(2000);
            this.callFunction();
        })
    }

    goOnPageUsers(users) {
        let user = `//div[@class='_4gt3b']/ul/li[${users}]/div/div[1]/div/div/a`;
        this.driver.findElement(this.By.xpath(user)).click();
        this.driver.wait(this.until.elementLocated(this.By.xpath("//div[@class='_de9bg']")));
    }

    checkPage () {
        let listDataUsers = "//div[@class='_de9bg']/ul";

        this.driver.findElement(this.By.xpath(`${listDataUsers}/li[2]/a/span`))
            .getText()
            .then((followers) => {

                let minCFollowers = Number(this.setting.AddUsersWithMinCountFollowers) || true,
                    maxCFollowers = Number(this.setting.AddUsersWithMaxCountFollowers) || true,
                    fllwers = Number(followers);

                if (minCFollowers &&
                    maxCFollowers &&
                    maxCFollowers >= fllwers &&
                    minCFollowers <= fllwers) {

                    this.driver.findElement(this.By.xpath(`${listDataUsers}/li[3]/a/span`))
                        .getText()
                        .then((followings) => {

                            let minCFollowings = Number(this.setting.AddUsersWithMinCountFollowing) || true,
                                maxCFollowings = Number(this.setting.AddUsersWithMaxCountFollowing) || true,
                                fllwings = Number(followings);

                            if (maxCFollowings &&
                                minCFollowings &&
                                maxCFollowings >= fllwings &&
                                minCFollowings <= fllwings) {
                                this.driver.findElement(this.By.xpath("//div[@class='_8mm5v']/span/span[1]/button")).click();
                                console.log('click');
                                this.pageSt = true;
                            } else {
                                this.pageSt = false
                            }
                        })
                } else {
                    this.pageSt = false
                }
            });

        if (this.pageSt) {
            this.countADD += 1;
        }
    }

}

export default ParserClass