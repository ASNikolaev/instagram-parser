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
        let self = this;
        this.driver.get('https://www.instagram.com/accounts/login/');
        this.driver.wait(self.until.titleIs('Вход • Instagram'), 1000);
        this.driver.findElement(self.By.name('username')).sendKeys(self.UserName);
        this.driver.findElement(self.By.name('password')).sendKeys(self.password);
        this.driver.findElement(self.By.xpath('//button')).click();
        this.driver.sleep(5000);
        this.driver.findElement(self.By.className("_q90d5"))
            .then(res => {
                console.log('password incorrect');
                self.driver.quit()
            })
            .catch(err => {
                this.driver.findElement(self.By.xpath("//div[@class='_pq5am']/div[3]/a")).click();
            });
    }

    searchFollowersViaMyFollowers () {
        let self = this;
        if (this.countADD >= this.setting.maxCountAddUsers) {
            this.driver.quit();
        }
        let prom = this.driver.findElement(self.By.className("_glq0k"))
            .then((res) => {
                let users = (this.steps.length === 0) ?
                    `https://www.instagram.com/${this.UserName}/` : this.steps[randomInteger(0, this.steps.length-1)];
                this.driver.get(users)

            })
            .catch((err) => {
                let followPath = "//div[@class='_de9bg']/ul/li[3]/a";
                this.driver.wait(self.until.elementLocated(self.By.xpath("//div[@class='_de9bg']")));
                this.driver.findElement(self.By.xpath(followPath)).click();
                this.driver.wait(self.until.elementLocated(self.By.xpath("//li[@class='_cx1ua']")));


                this.driver.findElements(self.By.className("_cx1ua")).then((elements) => {
                    let RandomUsers = randomInteger(1, elements.length);
                    this.goOnPageUsers(RandomUsers)

                });


                this.driver.findElement(self.By.className('_84y62'))
                    .then((res) => {
                        self.checkPage();
                    })
                    .catch((err) => {});

                this.driver.findElement(self.By.xpath("//div[@class='_8mm5v']/h1")).getText().then((name) => {
                    self.steps.push(`https://www.instagram.com/${name}/`)
                });
            });



        Promise.all([prom]).then((res) => {
            self.driver.sleep(2000);
            self.callFunction();
        })
    }

    goOnPageUsers(users) {
        let self = this;
        let user = `//div[@class='_4gt3b']/ul/li[${users}]/div/div[1]/div/div/a`;
        this.driver.findElement(self.By.xpath(user)).click();
        this.driver.wait(self.until.elementLocated(self.By.xpath("//div[@class='_de9bg']")));
    }

    checkPage () {
        let self = this;
        let listDataUsers = "//div[@class='_de9bg']/ul";

        this.driver.findElement(self.By.xpath(`${listDataUsers}/li[2]/a/span`))
            .getText()
            .then((followers) => {

                let minCFollowers = Number(self.setting.AddUsersWithMinCountFollowers) || true,
                    maxCFollowers = Number(self.setting.AddUsersWithMaxCountFollowers) || true,
                    fllwers = Number(followers);

                if (minCFollowers &&
                    maxCFollowers &&
                    maxCFollowers >= fllwers &&
                    minCFollowers <= fllwers) {

                    self.driver.findElement(self.By.xpath(`${listDataUsers}/li[3]/a/span`))
                        .getText()
                        .then((followings) => {

                            let minCFollowings = Number(self.setting.AddUsersWithMinCountFollowing) || true,
                                maxCFollowings = Number(self.setting.AddUsersWithMaxCountFollowing) || true,
                                fllwings = Number(followings);

                            if (maxCFollowings &&
                                minCFollowings &&
                                maxCFollowings >= fllwings &&
                                minCFollowings <= fllwings) {
                                self.driver.findElement(self.By.xpath("//div[@class='_8mm5v']/span/span[1]/button")).click();
                                console.log('click')
                                self.pageSt = true;
                            } else {
                                self.pageSt = false
                            }
                        })
                } else {
                    self.pageSt = false
                }
            });

        if (self.pageSt) {
            self.countADD += 1;
        }
    }

}

export default ParserClass