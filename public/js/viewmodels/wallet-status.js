define(['knockout','viewmodels/common/command'],function(ko,Command){
    var walletStatusType = function(){
        var self = this;
        self.total = ko.observable(0);
        self.stake = ko.observable(0);
        self.isLoadingStatus = ko.observable(false);
        self.blocks = ko.observable(0);
        self.totalBlocks = ko.observable(0);
        self.isStaking = ko.observable(false);
        this.available = ko.pureComputed(function(){
            var total = self.total(), stake = self.stake();
            return total - stake;
        }).extend({ rateLimit: 500 });

        this.blockProgress = ko.pureComputed(function(){
            var progress = 100 * self.blocks() / self.totalBlocks();
            console.log("Progress: " + progress);
            return progress + '%';
        }).extend({ rateLimit: 500 });
    };

    walletStatusType.prototype.load = function(){
        var self = this, 
            getInfoCommand = new Command('getinfo',[]), 
            getBlockCountCommand = new Command('getblockcount',[]),
            getStakingInfoCommand = new Command('getstakinginfo',[]);
            getPeerInfoCommand = new Command('getpeerinfo',[]);
        self.isLoadingStatus(true);
        var statusPromise = $.when(getInfoCommand.execute(), getBlockCountCommand.execute(), getStakingInfoCommand.execute(), getPeerInfoCommand.execute())
            .done(function(getInfoData, getBlockCountData, getStakingInfoData, getPeerInfoData){
                self.stake(getInfoData.stake);
                self.total(getInfoData.balance + self.stake());
                self.blocks(getInfoData.blocks);
                self.totalBlocks(self.findHighestPeerBlock(getPeerInfoData, { startingheight: getBlockCountData }));
                self.isStaking(getStakingInfoData.Staking);
                self.isLoadingStatus(false); 
            });
        return statusPromise;
    };

    walletStatusType.prototype.findHighestPeerBlock = function(peerInfo, knownHeight){
        return peerInfo.reduce(function(previous, current){ 
            var prevheight = previous ? previous.startingheight : 0, curheight = current ? current.startingheight : 0;
            return { startingheight: curheight > prevheight ? curheight : prevheight }; 
        }, knownHeight).startingheight;
    }

    return walletStatusType;
});
