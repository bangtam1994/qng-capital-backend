export const emailLeClubPrive = (userName: string) => `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      text-align: center;
      padding: 25px 20px;
      background-color: #454545 ;
      color: white;
    border-radius: 16px
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
    }
    .content {
      padding: 20px;
      color: #555;
      line-height: 1.6;
    }
    .offer {
      background-color: #f9f9f9;
      border-left: 4px solid #1F2937;
      padding: 10px 15px;
      margin: 25px 0;
    }
    .button {
    display: inline-block;
      background-color: #7C3AED;
      color: white;
      padding: 12px 20px;
      text-decoration: none;
      border-radius: 12px;
      margin-top: 20px;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #5629a3;
    color: white;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #777;
      border-top: 2px solid #eaeaea;
    }
      .payment {
      text-align: center;
      padding: 20px 0px;
       margin: 20px 0px;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #eaeaea;
    }
    .divider {
      height: 1px;
      background-color: #eaeaea;
      margin: 20px 0;
    }
    .contact-info {
      font-size: 10px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bienvenue dans la famille Honma Trading Club  🍥</h1>
    </div>
    <div class="content">
      <p>Merci de nous avoir rejoints, ${userName} ! Nous sommes ravis de t'accueillir dans notre communauté de traders passionnés.</p>
      
      <div class="offer">
        <h4 style="color: #303030; text-decoration: none; font-weight: bold">Ton Offre</h4>
        <p>Tu as souscrit à notre formule Le Club Privé, qui inclut :</p>
        <ul>
          <li>Accès à tout les modules vidéos (débutant/intermédiaire/avancé)</li>
          <li>Études de cas pratiques sur des trades réussis et ratés</li>
          <li>Outils exclusifs de backtesting pour affiner vos stratégies</li>
          <li>Checklist quotidienne de préparation pour optimiser chaque session de trading en PDF</li>
          <li>Analyse technique et fondamentale : maîtrisez les deux aspects du marché</li>
          <li>Accès à un groupe Discord d'apprentissage pour échanger avec d'autres membres</li>
          <li>2 LIVE/mois pour répondre à vos questions, vous proposer mes analyses du moment</li>
        </ul>
      </div>

      <h4  style="color: #303030; text-decoration: underline; font-weight: bold;    margin-top: 20px;">Prochaines Étapes</h4>
      <p>Voici où tu trouveras toutes les informations nécessaires sur la formation, ainsi qu'un accès direct à moi-même pour échanger. Tu pourras aussi la communauté du club privé avec des channels  d'échanges sur les trades et les analyses.</p>
      
      
      <div style="display:flex; justify-content: center"><a href="https://discord.gg/WpKFrNbYC3" class="button">Rejoindre le Discord Club Privé</a></div>
         
      <div class="payment">

      
       <h3
                  style="margin: 20px 0px; font-weight:bold;text-align:left;margin:0;font-size:16px"
                >
                  Détail du paiement
                </h3>
                <div style="padding:8px 0px 8px 0px">
                  <table
                    align="center"
                    width="100%"
                    cellpadding="0"
                    border="0"
                    style="table-layout:fixed;border-collapse:collapse"
                  >
                    <tbody style="width:100%">
                      <tr style="width:100%">
                        <td
                          style="box-sizing:content-box;vertical-align:middle;padding-left:0;padding-right:0"
                        >
                          <div style="padding:0px 0px 0px 0px">
                            <div
                              style="color:#000000;font-size:14px;font-weight:normal;text-align:left;padding:0px 0px 0px 0px"
                            >
                              Le Club Privé - Prélèvement mensuel
                            </div>
                          </div>
                        </td>
                        <td
                          style="box-sizing:content-box;vertical-align:middle;padding-left:0;padding-right:0"
                        >
                          <div style="padding:0px 0px 0px 0px">
                            <div
                              style="color:#000000;font-size:16px;font-weight:normal;text-align:right;padding:0px 0px 0px 0px"
                            >
                              89.90 €
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style="padding:0px 0px 16px 0px">
                  <table
                    align="center"
                    width="100%"
                    cellpadding="0"
                    border="0"
                    style="table-layout:fixed;border-collapse:collapse"
                  >
                    <tbody style="width:100%">
                      <tr style="width:100%">
                        <td
                          style="box-sizing:content-box;vertical-align:middle;padding-left:0;padding-right:0"
                        >
                          <div style="padding:0px 0px 0px 0px">
                            <div
                              style="color:#000000; font-weight:bold;text-align:left;padding:0px 0px 0px 0px"
                            >
                              Total
                            </div>
                          </div>
                        </td>
                        <td
                          style="box-sizing:content-box;vertical-align:middle;padding-left:0;padding-right:0"
                        >
                          <div style="padding:0px 0px 0px 0px">
                            <div
                              style="font-weight:bold;text-align:right;padding:0px 0px 0px 0px"
                            >
                              89.90 €
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style="padding:16px 0px 16px 0px">
                  <hr
                    style="width:100%;border:none;border-top:1px solid #EEEEEE;margin:0"
                  />
                </div>
              </div>
      
    </div>
    </div>
    
    
    
    <div class="footer">
      <div class="divider"></div>
      <p style="font-weight: bold;">Alex P.<br>Fondateur, Honma Trading Club</p>
      <div class="divider"></div>
      <div class="contact-info">
        <a href="https://www.honmatradingclub.com" style="color: #303030; text-decoration: none;">www.honmatradingclub.com</a> 
        <p>
        <a href="mailto:honmatradingclub@gmail.com" style="color: #1F2937; text-decoration: none;">✉︎ honmatradingclub@gmail.com</a> | 
          <a href="http://www.youtube.com/@HonmaTradingClub" style="color: #303030; text-decoration: none;">🎬 Youtube</a>  | 
        <a href="https://www.instagram.com/honmatradingclub" style="color: #1F2937; text-decoration: none;">🅾 honmatradingclub</a> | 
        <a href="https://telegram.me/alxqng" style="color: #1F2937; text-decoration: none;">➤ Telegram</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
