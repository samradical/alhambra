import './credits-page.scss';
import {
  IMAGE_DIR,
  TIME_ON_LOCATION_COVER,
} from '../../constants/config';

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

class CreditsPage extends Component {

  static propTypes = {
    browser: PropTypes.object.isRequired
  };

  componentDidMount() {
  }

  render() {
    const { browser } = this.props;
    return ( <div
      className = "o-page credits-page"
      >
      <Link key={'/'} to={`/`}>
          <span className="back-btn close-btn">BACK</span>
      </Link>
      <br></br>
      <div className="credits-wrapper">
        <h3>A mobile app walking tour by Lynn Marie Kirby, Christoph Steger and Sam Elie</h3>
        <br></br>
        <p>This mobile web app guides you around a short loop of the neighborhood surrounding the Alhambra Theater. Geo-tagged locations offer music, animations, and excerpts from our audio archive. The people featured in these conversations are:</p>
        <br></br>
        <br></br>

 <h3>Gunnar Anderson</h3>
        <p>Gunnar lives in the Julia Morgan building on Polk Street near Union. The building was originally owned by the woodcarver Jules Suppo who worked with Morgan at San Simeon. Suppo carved the ornate exterior of his own building. Gunnar is an architect himself — there have been many architects on Russian Hill, including Willis Polk, a relative of the president after whom the street was named. Gunnar showed us pictures of his sailboat and told us tales about sailing in the Bay. He left his native Norway after WWII to study architecture in New York, after graduation he moved to the Bay Area.</p>
        <br></br>
 <h3>Fadi Berbery</h3>
        <p>Fadi has been running Smoke Signals, the magazine shop on Polk Street near Vallejo, for over twenty years. He started the shop as he missed the kind of kiosk/ newspaper stand that one finds in Europe, where he first went after leaving Lebanon. Fadi carries magazines from all over the world. He used to carry daily papers from everywhere as well, until the newspaper business changed in the digital age.</p>
        <br></br>
<h3>Dr. Carl Blake</h3>
        <p>Carl is a wonderful musician and Director of Music at the Church for the Fellowship of All Peoples on Larkin Street. Carl is classically trained, and you will hear his piano rendition of Claude Debussy’s Gateway of the Alhambra Palace over the speakers at the gym. The inspiration for the piece came from a postcard sent to Debussy from the Spanish composer Manuel de Falla. The card depicted the Alhambra Gateway in Granada; Debussy never went in person.</p>
        <br></br>
 <h3>Dr. Rev. Dorsey Blake</h3>
        <p>Reverend Blake is a minster at the Church for the Fellowship for all Peoples on Larkin Street. He and Carl are brothers. He follows in the footsteps of Dr. Howard Thurman who started this first interdenominational, interracial and intercultural church in San Francisco in 1944. The church has a long history with social justice, from the early civil right movement though today. The church has many events open to the public, including an on-going social justice film series. Dr. Blake is currently a visiting Professor at Pacific School of Religion.</p>
        <br></br>
<h3>Marianne Farina</h3>
        <p>Marianne is a sister in the Congregation of the Sisters of the Holy Cross. She is a religious scholar with a PHD in theological ethics. Her interests are in interfaith dialogue, moral theology, as well as Islamic Philosophy and Theology. We talked with Marianne at the Graduate Theological Union, where she teaches; she is an old friend of Lynn’s Aunt who is in the same order.</p>
        <br></br>
 <h3>Stephen Goldstine</h3>
        <p>Stephen lives with his wife Emily Keeler in photographer Imogen Cunningham’s former house on Green Street. He was her assistant as a young man. Imogen’s often-photographed Calla Lilies still bloom in the garden. Stephen is a storyteller and knows all about the neighborhood as he has lived on Russian Hill since the 1950s. He was raised in the Richmond. He has always been involved in the arts, and is a great supporter of artists, as President of the San Francisco Art Institute and Graduate Director at the California College of the Arts, and most recently interim Principal at the Oakland School of the Arts.</p>
        <br></br>
<h3>David Lawrence Hemingway</h3>
        <p>David, also know as Sensai Shanus, runs what used to be called Karate One on Van Ness, and is now called K One Fitness. David shifted his teaching from purely Karate based, to more general martial arts and boxing training. Many children in the neighborhood have studied Karate at his school; exciting events happen at his dojo, from Black Belts tests to boxing events, and now painting openings too. David is a fixture of the neighborhood, and a man of many talents.</p>
        <br></br>
<h3>Alexis Joseph and Daria Joseph</h3>
        <p>Daria grew up on the corner of Hyde and Filbert. Her family also has an architectural past, as her grandfather was Erich Mendelsohn, a well-known modernist Architect who fled Germany before WW II. Daria spent her teenage years on Polk Street; in the 60’s it was the Carnaby Street of San Francisco. Her daughter, Alexis, had her first apartment in the neighborhood; she now runs her own shop and project workshop Case For Making in the Sunset. She is a designer and splendid artist, and frequent collaborator.</p>
        <br></br>
 <h3>Cecile Marie</h3>
        <p>Cecile’s father owned a bar on the corner of Polk Street and Bonita Alley. She grew up in the neighborhood. Cecile is a committed swimmer— swimming transformed her life. She swims at least four times a week down at Aquatic Park and is a long time member of the Southend Club. She has been a therapist for many years and now lives in the Sunset. She is trying to convince us to become Bay swimmers too!</p>
        <br></br>
 <h3>Laura Marks</h3>
        <p>Laura is a media scholar. We came across her book Enfoldment and Infinity: An Islamic Genealogy of New Media Art and knew we had to have a conversation. Laura teachers at Simon Fraser University in Vancouver, so we Skyped. Laura sees the broader relationships between pattern in Islamic art, and contemporary work in the digital realm, and was helpful in making us think about the complexities of pattern, and immersive experience.</p>
     <br></br>
 <h3>Jeannette De Martini and Gene De Martini</h3>
        <p>Jeanette grew up on Green Street in the house next to Imogen Cunningham. Jeanette tells stories of Imogen and fig jam from back yard trees, going to school at St. Bridget’s down the street, and seeing films at the Alhambra Theater. Her family was part of a large Italian American community in the neighborhood. Gene told us about the Alhambra block — the fountain, the pharmacy, and the free plates that used to given out at the movies. He also spoke of his days at Recology, and at Galileo high school where he was a football star. They still own the house on Green Street.</p>
           <br></br>
<h3>Sue De Martini</h3>
        <p>Sue is Gene and Jeanette’s daughter and lives in the house on Green Street. A long time resident of the neighborhood she has watched it change during her lifetime. Sue has witnessed the scary, dramatic, and humorous sides of San Francisco, as one of the first wave of women firefighters; she was also a Bay swimmer for many years and introduced us to Cecile. When we walk together she knows everybody from swimming or firefighting, or from when the city was a smaller place, and neighborhoods less transient.</p>
        <br></br>
 <h3>Quensella Miller</h3>
        <p>Q lives on Van Ness Ave and runs A Q Trip, a fun packed tour of hidden places and histories of San Francisco. Q is a San Francisco native, with deep routes in the city and knowledge of its history. We first ran into one another at William Cross wine bar, a hangout for the neighborhood. When we met with Q she gave us her hidden tour of the neighborhood, including Shanghai Kelly’s on the corner of Polk and Broadway, an old Irish bar named after the practice of capturing drunks to man ships during the Gold Rush when entire crews left to prospect.</p>
        <br></br>
 <h3>Mark Ong</h3>
        <p>Mark grew up in the neighborhood. He is the son of Jade Snow Wong, the potter and author of Fifth Chinese Daughter. They shared a studio, Side by Side, for many years on Polk Street, in the building that now houses Pop Physique. Mark is a very sensitive designer and spoke to us about philosophy and growing up both as the son of an artist and in a Chinese American family in the 50’s.</p>
        <br></br>
 <h3>Leesa Kozel and Paul Rosley</h3>
        <p>Leesa and Paul live up on Green Street near the octagonal house. Paul grew up in the neighborhood and went to Russian Hill Pre-school which used to be in a little apartment next door to Imogen’s / Stephen’s house. Graduation parties happened in the neighborhood, butterflies were released at Ina Coolbirth Park, middle school on Polk Street, and then in homes together, and there was always Swensen’s Ice cream. Leesa and Paul are fun to be around.</p>
        <br></br>
<h3>Anysa Saleh</h3>
        <p>We had a conversation with Anysa about how to create sacred spaces in daily life. Anysa is a Bay Area artist who has been exploring what it means to be a contemporary Muslim woman in the US, including wearing a head scarf in public, being harassed on the bus and being defended by another person sitting next to her. She grew up in Yemen and in in Bakersfield, California.</p>
        <br></br>
 <h3>Michael Schneider</h3>
        <p>Michael teaches math at the California College of the Arts, but we first met him through his work The Mathematical Archetypes of Nature, Art, and Science. We knew we had to have a conversation. We took a walk in a park together. Michael showed us the patterns all around us, the Fibonacci sequence in flowers, the mathematical relation of leaves to hands, and of course we discussed the seventeen repeatable tessellations – the wallpaper patterns – in the Alhambra Palace.</p>
        <br></br>
<h3>Keyvan Shovir</h3>
        <p>We meet with Keyvan to talk to him about calligraphy. He was trained in classical calligraphy and pattern design in Iran before emigrating to the US. We have been interested in learning more about the history of pattern in both architecture and art though out the Islamic world. He has melded his interest in sacred geometry and the street in his current work.</p>
        <br></br>
<h3>Doris Sloan</h3>
        <p>We came upon Doris’ book Geology of the San Francisco Bay Region and decided we had to have a conversation with her about the geology of Russian Hill — another history we could not see. We learned about Graywacke, a variety of hard sandstone, which makes up the rock of Russian Hill. Doris is a wonderful explainer, having taught at UC Berkeley for many years. She told us about the processes and time frames of this slow geological evolution that transforms sedimentary rock into what we stand on, and helped us understand both the broader Bay Area landscape and the neighborhood.</p>
        <br></br>
<h3>Zach Zaltsman</h3>
        <p>Zach is the owner of Back Stage. His first salon was in one of the lobby spaces at the front of the Alhambra Theater, where the old Alhambra soda fountain and candy shop used to be. When the theater closed down and the interior was being dismantled to make way for the gym, Zach rescued two purple benches from the lobby. The benches now line the wall at Back Stage. We talked to Zach about living and working in the neighborhood, and the changes he has seen since he arrived here from Ukraine after the disintegration of the Soviet Union more than twenty years ago.</p>
        <br></br>
      </div>
      </div>
    );
  }
}


export default connect(({ browser }) => ({
  browser,
}))(CreditsPage);
