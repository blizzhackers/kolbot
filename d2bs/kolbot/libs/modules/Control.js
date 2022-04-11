/**
 * @description Some abstraction around the control functions.
 * @author Jaenster
 */
(function (module) {

    /**
     * @constructor - Not callable as a function
     *
     * @method Control.click(targetx, targety)
     * @method Control.setText(text)
     * @method Control.getText(text)
     */
    function Control(type, x, y, xsize, ysize) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.xsize = xsize;
        this.ysize = ysize;

        return new Proxy(this, {
            get: function (target, p) {
                const passtroughFunc = ['click', 'setText', 'getText'];

                if (p === 'valueOf') {
                    return target;
                }

                const control = getControl(target.type, target.x, target.y, target.xsize, target.ysize);
                if (p === 'control') {
                    return control;
                }

                // Relay on old ControlAction functions
                if (passtroughFunc.indexOf(p) !== -1) {
                    return (...args) => ControlAction[p].apply(ControlAction, [target.type, target.x, target.y, target.xsize, target.ysize].concat(args));
                }

                // if control is found, and it's a property of the control
                if (typeof control === 'object' && control && control.hasOwnProperty(p)) {
                    return control[p];
                }

                // The target has it
                if (target.hasOwnProperty(p)) {
                    return target[p];
                }

                return null;
            }
        })

    }

    Control.SinglePlayer = new Control(-1, 264, 324, 272, 35);
    Control.BattleNet = new Control(-1, 264, 366, 272, 35);
    Control.OtherMultiplayer = new Control(-1, 264, 433, 272, 35);
    Control.Exit = new Control(-1, 33, 572, 128, 35);
    Control.Username = new Control(-1, 322, 396, 162, 19);
    Control.Password = new Control(-1, 322, 396, 162, 19);
    Control.Login = new Control(-1, 264, 484, 272, 35);

    Control.SinglePlayerNormal = new Control(-1, 264, 297, 272, 35);
    Control.SinglePlayerNightmare = new Control(-1, 264, 340, 272, 35);
    Control.SinglePlayerHell = new Control(-1, 264, 383, 272, 35);

    Control.OpenBattleNet = new Control(-1, 264, 310, 272, 35);
    Control.TcpIp = new Control(-1, 264, 350, 272, 35);
    Control.TcpIpHost = new Control(-1, 265, 206, 272, 35);
    Control.TcpIpJoin = new Control(-1, 265, 264, 272, 35);

    Control.IPAdress = new Control(-1, 300, 268, -1, -1);
    Control.IPAdressOk = new Control(-1, 421, 337, 96, 32);

    Control.JoinGameWindow = new Control(6, 652, 469, 120, 20);
    Control.JoinGamePass = new Control(1, 606, 148, 155, 20);
    Control.JoinGameName = new Control(1, 432, 148, 155, 20);

    Control.CreateGameWindow = new Control(6, 533, 469, 120, 20);
    Control.GameName = new Control(1, 432, 162, 158, 20);
    Control.GamePass = new Control(1, 432, 217, 158, 20);
    Control.CharacterDifferenceButton = new Control(6, 431, 341, 15, 16);
    Control.CharacterDifference = new Control(1, 657, 342, 27, 20);

    Control.CreateGame = new Control(6, 594, 433, 172, 32);
    Control.Normal = new Control(6, 430, 381, 16, 16);
    Control.Nightmare = new Control(6, 555, 381, 16, 16);
    Control.Hell = new Control(6, 698, 381, 16, 16);

    Control.EnterChat = new Control(6, 27, 480, 120, 20);
    Control.Char4 = new Control(4, 237, 457, 72, 93);
    Control.CharSelectBack = new Control(6, 33, 572, 128, 35);

    Control.LoginErrorText = new Control(4, 199, 377, 402, 140);
    Control.OkCentered = new Control(6, 351, 337, 96, 32);
    Control.HellSP = new Control(-1, 264, 383, 272, 35);
    Control.NightmareSP = new Control(-1, 264, 340, 272, 35);
    Control.NormalSP = new Control(-1, 264, 297, 272, 35);

    Control.ErrorOk = new Control(6, 335, 412, 128, 35);
    Control.UnableToConnectOk = new Control(6, 335, 450, 128, 35);

    Control.inUseBy = new Control(4, 158, 310, 485, 40);
    Control.cancelWait = new Control(6, 330, 416, 128, 35);

    module.exports = Control;

})(module);