define(['knockout','common/dialog','viewmodels/common/confirmation-dialog','viewmodels/common/command'], function(ko,dialog,ConfirmationDialog,Command) {
    var defaultWalletStakingUnlockTime = 999999;
    var walletPassphraseType = function(options){
        var self = this,
            options = options || {};
        this.forEncryption = ko.observable(options.forEncryption) || ko.observable(false);
        this.walletPassphrase = ko.observable(options.walletPassphrase || '');
        this.walletPassphraseConfirm = ko.observable('');
        this.stakingOnly = options.stakingOnly === false ? ko.observable(false) : ko.observable(true);
        this.canSpecifyStaking = options.canSpecifyStaking === false ? ko.observable(false) : ko.observable(true);
        this.canSubmit = ko.computed(function(){
            //return true;
            var passphrase = self.walletPassphrase(),
                passphraseConfirm = self.walletPassphraseConfirm();    

            return passphrase.length > 0 && (self.forEncryption() ? passphrase === passphraseConfirm : true) ;
        });
    };

    walletPassphraseType.prototype.userPrompt = function(encrypt, title, message, affirmativeButtonText){
        var self = this, 
            walletPassphraseDeferred = $.Deferred(),
            passphraseDialog = new ConfirmationDialog({
                title: title || 'Wallet passphrase',
                contentTemplate: "modals/password-prompt",
                context: self,
                canAffirm: self.canSubmit,
                allowClose: false,
                showNegativeButton: false,
                message: encrypt ? "Specify a passphrase for encrypting your wallet" : "",
                affirmativeButtonText: affirmativeButtonText,
                affirmativeHandler: function(walletPassphrsaeDeferred){
                    if(self.canSubmit()){
                        self.openWallet(encrypt)
                            .done(function(result){
                                walletPassphraseDeferred.resolve($.extend(result, { passphrase: self.walletPassphrase() } ));
                            })
                            .fail(function(error){
                                walletPassphraseDeferred.reject(error);
                            });
                    }
                }
            });
            self.forEncryption(encrypt);
            passphraseDialog.open();

        return walletPassphraseDeferred.promise();
    };

    walletPassphraseType.prototype.openWallet = function(encrypt){
        var self = this, openWalletDeferred= $.Deferred(), 
            walletPassphraseCommand = encrypt ? new Command('encryptwallet', [self.walletPassphrase()]) :
                new Command('walletpassphrase', [encodeURIComponent(self.walletPassphrase()), defaultWalletStakingUnlockTime,  self.stakingOnly()]);

        walletPassphraseCommand.execute()
            .done(function(result){
                openWalletDeferred.resolve(result);
            })
            .fail(function(error){
                //Consider creating a custom error object with message, static codes, etc...
                openWalletDeferred.reject(error);
            })
            .always(function(){
                //Close the dialog 
            });

        return openWalletDeferred.promise();
    };
    return walletPassphraseType;
});
