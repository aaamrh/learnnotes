# Git 
## fork: GitHub怎样fork别人代码到自己仓库并进行贡献

> 1. 在 Github 上 fork 想要参与的项目仓库 **qingtong/pinghu**, fork后会生成自己的项目 **marh/pinghu**
> 2. `git clone 自己的项目`
> 3. `git add XX`，`git commit -m ""` 进行更新，提交
> 4. `git push origin master` 推送到自己的远程仓库  **marh/pinghu**
> 5. 在 github 上新建 `pull-request` 请求
>
> 当我们睡了一觉起来，**qingtong/pinghu**仓库可能已经更新，我们要同步最新代码
>
> 6. 给远程的上游仓库**qingtong/pinghu**配置一个 remote 。
>    * `git remote -v` 查看远程状态
>    * `git remote add upstream 远程仓库qingtong/pinghu链接` 
>       * 例如：`git remote add upstream https://xxx.com/Qingtong/pinghu.git`
> 7. `git fetch upstream` 将远程所有的分支fetch下来
> 8. `git merge upstream/master` 合并非master分支的代码
> 9. `git pull upstream master` 可以代替步骤 7+8。 `git pull = fetch + merge` 
> 
>此时自己本地的代码就是最新的了，修改完代码后，`重复步骤 3-5`