define(['knockout','common/dialog','viewmodels/wallet-status','viewmodels/send/send','viewmodels/receive/receive','viewmodels/history/history','viewmodels/console/console', 'bindinghandlers/modal','viewmodels/common/wallet-passphrase', 'viewmodels/common/command'], 
function(ko, dialog, WalletStatus, Send, Receive, History, Console, Modal, WalletPassphrase, Command){

    var walletType = function(options){
        var self = this;
        self.btcdTotal = ko.observable(0);
        self.btcdAvailable = ko.observable(0);
        self.btcdStaking = ko.observable(0);
        self.currentView = ko.observable('send');
        self.sidebarToggled = ko.observable(false);
        self.isWalletUnencrypted = ko.observable(true);
        
        self.checkEncryptionStatus();
        self.walletStatus = new WalletStatus({parent: self});
        self.send = new Send({parent: self}); 
        self.history = new History({parent: self}); 
        self.console = new Console({parent: self}); 
        self.receive = new Receive({parent: self});
        self.refresh();
        self.pollWalletStatus();
    };

    walletType.prototype.unlockWallet = function(){
        new WalletPassphrase({canSpecifyStaking:true}).userPrompt(false, 'Wallet unlock', 'This action will unlock the wallet for sending','OK')
            .done(function(result){
                console.log(result);
                dialog.notification("Wallet unlocked");
            })
            .fail(function(error){
                console.log(error);
                dialog.notification(error.message);
            });
        //dialog.openDialog({ text:ko.observable('Test')}, 'modals/placeholder');
    };

    walletType.prototype.lockWallet = function(){
        var walletLockCommand = new Command('walletlock',[]).execute()
            .done(function(){
                dialog.notification("Wallet locked");
            })
            .fail(function(){
                dialog.notification("Wallet already locked");
            });
    };

    walletType.prototype.encryptWallet = function(){
        dialog.notification("Coming soon");    
    };

    walletType.prototype.walletPassphraseAffirmative = function(){

    };

    walletType.prototype.toggleSidebar = function(){
        this.sidebarToggled(!this.sidebarToggled());
    };

    walletType.prototype.refresh = function(refreshTargets){
        return $.when(this.walletStatus.load(), this.history.load(), this.receive.load());
    };

    walletType.prototype.pollWalletStatus = function(){
        var self = this;
        setTimeout(function(){
            self.refresh().then(function(){
                self.pollWalletStatus();
            });
        },60000);
    };

    walletType.prototype.checkEncryptionStatus = function(){
        var self = this;
        var walletPassphraseCommand = new Command('walletpassphrase',[]),
            encryptionStatusPromise = walletPassphraseCommand.execute()
            .done(function(data){
                dialog.notification("There is something seriously wrong with everything.");
            })
            .fail(function(error){
                switch(error.code){
                    case -15:  //wallet is unencrypted
                        self.isWalletUnencrypted(true);
                        self.promptToEncrypt();
                        break;
                    case -1: //wallet is locked
                        self.isWalletUnencrypted(false);
                        self.promptToUnlockForStaking();
                        break;
                    case -17: //wallet is already unlocked
                        break;
                };
            });
    };

    walletType.prototype.promptToEncrypt = function(){
        new WalletPassphrase().userPrompt(true,'Encrypt', 'Encrypt','OK')
            .done(function(result){
                console.log(result);
                dialog.notification("Wallet successfully encrypted. Restart your btcd daemon to continue.");
            })
            .fail(function(error){
                console.log(error);
                dialog.notification(error.message);
            });
    };

    walletType.prototype.promptToUnlockForStaking = function(){
        new WalletPassphrase({canSpecifyStaking:true}).userPrompt(false, 'Wallet unlock', 'Unlock the wallet','OK')
            .done(function(result){
                console.log(result);
            })
            .fail(function(error){
                console.log(error);
                dialog.notification(error.message);
            });
    };

    return walletType; 
});
