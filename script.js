document.addEventListener('DOMContentLoaded', () => {
    let board = null; 
    const game = new Chess(); 
    const moveHistory = document.getElementById('move-history');
    const aiLevelDisplay = document.getElementById('ai-level'); 
    let moveCount = 1; 
    let userColor = 'w'; 
    let aiLevel = 1; 


    const pieceValues = {
        'p': 100, 
        'n': 320, 
        'b': 330, 
        'r': 500, 
        'q': 900, 
        'k': 10000 
    };

   
    const boardEvaluationTable = {
        'p': [
            0, 0, 0, 0, 0, 0, 0, 0,
            50, 50, 50, 50, 50, 50, 50, 50,
            10, 10, 20, 30, 30, 20, 10, 10,
            5, 5, 10, 25, 25, 10, 5, 5,
            0, 0, 0, 20, 20, 0, 0, 0,
            5, -5, -10, 0, 0, -10, -5, 5,
            5, 10, 10, -20, -20, 10, 10, 5,
            0, 0, 0, 0, 0, 0, 0, 0
        ],
        'n': [
            -50, -40, -30, -30, -30, -30, -40, -50,
            -40, -20, 0, 0, 0, 0, -20, -40,
            -30, 0, 10, 15, 15, 10, 0, -30,
            -30, 5, 15, 20, 20, 15, 5, -30,
            -30, 0, 15, 20, 20, 15, 0, -30,
            -30, 5, 10, 15, 15, 10, 5, -30,
            -40, -20, 0, 5, 5, 0, -20, -40,
            -50, -40, -30, -30, -30, -30, -30, -50
        ],
        'b': [
            -20, -10, -10, -10, -10, -10, -10, -20,
            -10, 0, 0, 0, 0, 0, 0, -10,
            -10, 0, 5, 10, 10, 5, 0, -10,
            -10, 5, 5, 10, 10, 5, 5, -10,
            -10, 0, 10, 10, 10, 10, 0, -10,
            -10, 10, 10, 10, 10, 10, 10, -10,
            -10, 5, 0, 0, 0, 0, 5, -10,
            -20, -10, -10, -10, -10, -10, -10, -20
        ],
        'r': [
            0, 0, 0, 0, 0, 0, 0, 0,
            5, 10, 10, 10, 10, 10, 10, 5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            -5, 0, 0, 0, 0, 0, 0, -5,
            0, 0, 0, 5, 5, 0, 0, 0
        ],
        'q': [
            -20, -10, -10, -5, -5, -10, -10, -20,
            -10, 0, 0, 0, 0, 0, 0, -10,
            -10, 0, 5, 5, 5, 5, 0, -10,
            -5, 0, 5, 5, 5, 5, 0, -5,
            0, 0, 5, 5, 5, 5, 0, -5,
            -10, 5, 5, 5, 5, 5, 0, -10,
            -10, 0, 5, 0, 0, 0, 0, -10,
            -20, -10, -10, -5, -5, -10, -10, -20
        ],
        'k': [ 
            -30, -40, -40, -50, -50, -40, -40, -30,
            -30, -40, -40, -50, -50, -40, -40, -30,
            -30, -40, -40, -50, -50, -40, -40, -30,
            -30, -40, -40, -50, -50, -40, -40, -30,
            -20, -30, -30, -40, -40, -30, -30, -20,
            -10, -20, -20, -20, -20, -20, -20, -10,
            20, 20, 0, 0, 0, 0, 20, 20,
            20, 30, 10, 0, 0, 10, 30, 20
        ]
    };




    const evaluateBoard = () => {
        let totalEvaluation = 0;
        const boardState = game.board(); 

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const square = boardState[r][c];
                if (square) {
                    const piece = square.type;
                    const color = square.color;
                    let value = pieceValues[piece];
                    


                    const aiActualColor = userColor === 'w' ? 'b' : 'w';

                    const idx = (aiActualColor === 'w') ? ((7 - r) * 8 + c) : (r * 8 + c); 
                    if (boardEvaluationTable[piece]) {
                        value += boardEvaluationTable[piece][idx];
                    }

                    if (color === userColor) { 
                        totalEvaluation -= value;
                    } else { // AIの駒
                        totalEvaluation += value;
                    }
                }
            }
        }
        return totalEvaluation;
    };

    // ゲーム終了時のメッセージを表示する関数
    const displayGameResult = () => {
        if (game.in_checkmate()) {
            // 現在のターンがチェックメイトされた側
            if (game.turn() === userColor) {
                alert("GAME OVER! あなたの負けです。");
            } else {
                alert("You Win! おめでとうございます！");
            }
        } else if (game.in_draw()) {
            alert("DRAW! 引き分けです。");
        } else if (game.in_stalemate()) {
            alert("STALEMATE! 引き分けです。");
        } else if (game.in_threefold_repetition()) {
            alert("DRAW! 三歩反復による引き分けです。");
        } else if (game.insufficient_material()) {
            alert("DRAW! 駒不足による引き分けです。");
        }
    };


    // Function to make the AI's move based on difficulty level
    const makeAiMove = () => {
        const possibleMoves = game.moves({ verbose: true });

        // AIの手番でゲームが終了しているかチェック
        if (game.game_over()) {
            displayGameResult();
            return;
        }

        let bestMove = null;
        let bestEvaluation = -Infinity; // AIにとって最良の評価値

        // レベルごとのAIロジック
        if (aiLevel === 1) {
            // レベル1: 完全なランダム (初心者向け)
            const randomIdx = Math.floor(Math.random() * possibleMoves.length);
            bestMove = possibleMoves[randomIdx];
        } else if (aiLevel >= 2 && aiLevel <= 9) {
            // レベル2-9: 簡易的な評価と選択
            // 各レベルで少しずつ賢くする（ここではレベル5-9で少し考えるように）
            let candidates = []; // 良いと思われる手の候補

            for (let i = 0; i < possibleMoves.length; i++) {
                const move = possibleMoves[i];
                game.move(move);

                // Checkmateの優先
                if (game.in_checkmate()) {
                    bestMove = move;
                    game.undo();
                    break;
                }

                const currentEvaluation = evaluateBoard(); // 盤面の評価値
                game.undo();

                if (aiLevel >= 5) { // レベル5以上はより評価を重視
                    if (currentEvaluation > bestEvaluation) {
                        bestEvaluation = currentEvaluation;
                        bestMove = move;
                        candidates = [move]; // 新しい最良手が見つかったのでリセット
                    } else if (currentEvaluation === bestEvaluation) {
                        candidates.push(move); // 同じ評価値なら候補に追加
                    }
                } else { // レベル2-4: よりシンプルな優先順位（捕獲、チェックなど）
                    if (move.flags.includes('c') || game.in_check()) { // 簡易的な攻撃手
                        candidates.push(move);
                    } else if (currentEvaluation > bestEvaluation / 2) { // ある程度良い手
                        candidates.push(move);
                    } else { // その他
                        candidates.push(move); // とりあえず全ての候補を入れる
                    }
                }
            }

            if (!bestMove) { // チェックメイトが見つからず、まだbestMoveが選ばれていない場合
                if (candidates.length > 0) {
                    // 候補の中からランダムに選択（レベル5以上ではbestMoveが既に設定されているはずなので、ここでは主にレベル2-4用）
                    bestMove = candidates[Math.floor(Math.random() * candidates.length)];
                } else {
                    bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]; // 最終フォールバック
                }
            }

        } else if (aiLevel === 10) {
            // レベル10: 非常に強力なAI (2手先まで簡易的に読む)
            // ミニマックスの簡易的な実装
            bestEvaluation = -Infinity;

            for (let i = 0; i < possibleMoves.length; i++) {
                const move1 = possibleMoves[i];
                game.move(move1);

                // 1手目でチェックメイトできるなら即座にその手を選ぶ
                if (game.in_checkmate()) {
                    bestMove = move1;
                    game.undo();
                    break;
                }

                // 相手の可能な手を評価（ミニマックスの相手番）
                let minOpponentEvaluation = Infinity;
                const opponentMoves = game.moves({ verbose: true });

                if (opponentMoves.length === 0) {
                     // 相手に手がない場合（ステイルメイトまたはチェックメイト）
                     if (game.in_checkmate()) {
                         // AIがチェックメイトの場合、最高の評価
                         // 相手が手番でチェックメイトなので、プレイヤーが負け
                         minOpponentEvaluation = 100000; // AIにとって非常に高い評価
                     } else {
                         // ステイルメイトの場合、引き分けなので評価は低め
                         minOpponentEvaluation = 0; // 引き分けを表現
                     }
                } else {
                    for (let j = 0; j < opponentMoves.length; j++) {
                        const move2 = opponentMoves[j];
                        game.move(move2);

                        // 相手がチェックメイトできるなら、AIにとっては最悪
                        if (game.in_checkmate()) {
                            minOpponentEvaluation = -100000; // 相手にチェックメイトされる手は最悪
                            game.undo();
                            break; // 相手の最良手が見つかったので、これ以上相手の手を評価する必要はない
                        }

                        const currentBoardEvaluation = evaluateBoard();
                        minOpponentEvaluation = Math.min(minOpponentEvaluation, currentBoardEvaluation);
                        game.undo();
                    }
                }
                
                game.undo(); // 1手目を元に戻す

                // 現在のAIの評価が、それまでの最良評価より高ければ更新
                if (minOpponentEvaluation > bestEvaluation) {
                    bestEvaluation = minOpponentEvaluation;
                    bestMove = move1;
                }
            }
        }

        if (bestMove) {
            game.move(bestMove);
            board.position(game.fen());
            recordMove(bestMove.san, moveCount);
            moveCount++;
            // AIが手を指した後でゲーム終了をチェック
            if (game.game_over()) {
                displayGameResult();
            }
        }
    };

    // Function to record and display a move in the move history
    const recordMove = (move, count) => {
        const formattedMove = count % 2 === 1 ? `${Math.ceil(count / 2)}. ${move}` : `${move} -`;
        moveHistory.textContent += formattedMove + ' ';
        moveHistory.scrollTop = moveHistory.scrollHeight; // Auto-scroll to the latest move
    };

    // Function to handle the start of a drag position
    const onDragStart = (source, piece) => {
        // Allow the user to drag only their own pieces based on color
        // ゲームが終了している場合はドラッグを許可しない
        return !game.game_over() && piece.search(userColor) === 0;
    };

    // Function to handle a piece drop on the board
    const onDrop = (source, target) => {
        const move = game.move({
            from: source,
            to: target,
            promotion: 'q',
        });

        if (move === null) return 'snapback';

        recordMove(move.san, moveCount);
        moveCount++;

        // ユーザーが手を指した後でゲーム終了をチェック
        if (game.game_over()) {
            displayGameResult();
        } else {
            // ゲームが終了していなければAIの次の手を待つ
            window.setTimeout(makeAiMove, 250);
        }
    };

    // Function to handle the end of a piece snap animation
    const onSnapEnd = () => {
        board.position(game.fen());
    };

    // Configuration options for the chessboard
    const boardConfig = {
        showNotation: true,
        draggable: true,
        position: 'start',
        onDragStart,
        onDrop,
        onSnapEnd,
        moveSpeed: 'fast',
        snapBackSpeed: 500,
        snapSpeed: 100,
    };

    // ボードのサイズを動的に設定する関数を追加
    const setBoardSize = () => {
        const boardContainer = document.getElementById('board');
        // 親要素の幅に合わせてボードのサイズを調整
        const containerWidth = boardContainer.parentElement.offsetWidth;
        // 画面幅と最大の400pxを比較して小さい方を採用
        const newSize = Math.min(containerWidth, 400); 
        boardContainer.style.width = `${newSize}px`;
        boardContainer.style.height = `${newSize}px`; // 高さを幅に合わせる
        if (board) { // boardが初期化されている場合のみpositionを更新
            board.resize(); // chessboard.js のリサイズ関数を呼び出す
        }
    };

    // Initialize the chessboard
    board = Chessboard('board', boardConfig);
    setBoardSize(); // ボード初期化後にも一度サイズを設定

    // 初期ロード時とウィンドウのリサイズ時にボードサイズを設定
    window.addEventListener('resize', setBoardSize);


    // Event listener for the "Play Again" button
    document.querySelector('.play-again').addEventListener('click', () => {
        game.reset();
        board.start();
        moveHistory.textContent = '';
        moveCount = 1;
        userColor = 'w';
        aiLevel = 1; // Reset AI level on new game
        aiLevelDisplay.textContent = `(AI Level: ${aiLevel})`;
        setBoardSize(); // リセット時にもボードサイズを再調整
    });

    // Event listener for the "Level Down" button
    document.querySelector('.level-down').addEventListener('click', () => {
        if (aiLevel > 1) {
            aiLevel--;
            aiLevelDisplay.textContent = `(AI Level: ${aiLevel})`;
        }
    });

    // Event listener for the "Level Up" button
    document.querySelector('.level-up').addEventListener('click', () => {
        if (aiLevel < 10) {
            aiLevel++;
            aiLevelDisplay.textContent = `(AI Level: ${aiLevel})`;
        }
    });

    // Event listener for the "Set Position" button (repurposed for FEN input)
    document.querySelector('.set-pos').addEventListener('click', () => {
        const fen = prompt("Enter the FEN notation for the desired position!");
        if (fen !== null) {
            if (game.load(fen)) {
                board.position(fen);
                moveHistory.textContent = '';
                moveCount = 1;
                // FENを入力した場合、どちらの番かによってuserColorを自動判別
                // 例: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 (wは白番)
                const fenParts = fen.split(' ');
                if (fenParts.length > 1) {
                    userColor = fenParts[1]; // FENの2番目の要素が現在の手番の色
                } else {
                    userColor = 'w'; // FENが不完全な場合はデフォルトで白番
                }
                aiLevel = 1; // FEN入力時はAIレベルをリセット
                aiLevelDisplay.textContent = `(AI Level: ${aiLevel})`;
                setBoardSize(); // FEN入力時にもボードサイズを再調整
            } else {
                alert("Invalid FEN notation. Please try again.");
            }
        }
    });

    // Flip Boardボタンの動作変更
    // 注意: index.html には .flip-board ボタンが定義されていません。
    // もしこの機能が必要であれば、index.html にボタンを追加してください。
    // 例: <button class="flip-board">盤面を反転</button>
    const flipButton = document.querySelector('.flip-board');
    if (flipButton) {
        flipButton.addEventListener('click', () => {
            board.flip();
            // 盤面をフリップした後、AIの色も反転させる
            userColor = userColor === 'w' ? 'b' : 'w';
            // AIの手番になった場合、すぐに手を指させる
            if (game.turn() !== userColor) {
                makeAiMove();
            }
            setBoardSize(); // フリップ時にもボードサイズを再調整
        });
    }
});