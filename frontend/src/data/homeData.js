import runningImg from '../assets/image/running.webp';
import lifestyleImg from '../assets/image/lifestyle.webp';
import basketImg from '../assets/image/basket.webp';
import footballImg from '../assets/image/football.webp';
import outdoorImg from '../assets/image/outdoor.jpeg';
import slidesImg from '../assets/image/slides.webp';
import pumaRunningImg from '../assets/image/runing puma.webp';
import campusClassicImg from '../assets/image/campus clasic.webp';
import adidasStreetImg from '../assets/image/adidas street.jpeg';
import casualVansImg from '../assets/image/casual vans.jpeg';
import lifestyleNikeImg from '../assets/image/lifestyl nike.jpeg';
import oxfordCampusImg from '../assets/image/oxford campus.webp';

export const bestSellers = [
  { slug: 'eclipse-sneakers',   name: { fr: 'Sneaker Eclipse',           ar: 'حذاء إيكليبس' },          brand: 'Nike',        image: 'https://cdn.prod.website-files.com/689251469afed457b38b7028/68a0368f03f08bf146a04fde_eclipse.png',    price: 14500, oldPrice: 15900, rating: 4.3 },
  { slug: 'campus-oxford',      name: { fr: 'Sneaker Oxford Campus',     ar: 'حذاء أكسفورد كامبوس' },   brand: 'Campus',      image: oxfordCampusImg,  price: 12500, oldPrice: 14000, rating: 4.3 },
  { slug: 'converse-boot',      name: { fr: 'Boot Converse Classic',     ar: 'بوت كونفرس كلاسيك' },     brand: 'Converse',    image: 'https://cdn.prod.website-files.com/689251469afed457b38b7028/68a036b612965524103dc627_f-boot.png',     price: 18900, oldPrice: 21000, rating: 4.1 },
  { slug: 'adidas-sport',       name: { fr: 'Chaussure Sport Adidas',    ar: 'حذاء رياضي أديداس' },     brand: 'Adidas',      image: 'https://cdn.prod.website-files.com/689251469afed457b38b7028/68a0370a1a953b87bd54b59d_shoe-2.png',    price: 11200, oldPrice: 13500, rating: 4.3 },
  { slug: 'nike-lifestyle',     name: { fr: 'Sneaker Lifestyle Nike',    ar: 'حذاء لايف ستايل نايك' },  brand: 'Nike',        image: lifestyleNikeImg, price: 16500, oldPrice: 17800, rating: 4.1 },
  { slug: 'vans-high-top',      name: { fr: 'Vans High Top',             ar: 'فانز هاي توب' },           brand: 'Vans',        image: 'https://cdn.prod.website-files.com/689251469afed457b38b7028/68a03805667e031c13a3e7cc_f-hight-neck.png', price: 9800,  oldPrice: 11000, rating: 4.2 },
  { slug: 'asics-running',      name: { fr: 'Chaussure de running Asics',ar: 'حذاء ركض أسيكس' },       brand: 'Asics',       image: 'https://cdn.prod.website-files.com/689251469afed457b38b7028/68a0385b89e3d0f08c4744e7_running-2.png',  price: 13400, oldPrice: 15000, rating: 4.4 },
  { slug: 'vans-loafer',        name: { fr: 'Sneaker Casual Vans',       ar: 'حذاء كاجوال فانز' },      brand: 'Vans',        image: casualVansImg,    price: 15500, oldPrice: 16200, rating: 4.5 },
];

export const newArrivals = [
  { slug: 'puma-running',           name: { fr: 'Chaussure de running Puma',   ar: 'حذاء ركض بوما' },           brand: 'Puma',        image: pumaRunningImg,   price: 12500, oldPrice: 14000, rating: 4.8 },
  { slug: 'campus-classic-sneaker', name: { fr: 'Sneaker Campus Classic',      ar: 'سنيكر كامبوس كلاسيك' },   brand: 'Campus',      image: campusClassicImg, price: 15000, oldPrice: 16500, rating: 4.5 },
  { slug: 'converse-high-top',      name: { fr: 'Sneaker montante Converse',   ar: 'حذاء كونفرس عالي' },       brand: 'Converse',    image: 'https://cdn.prod.website-files.com/689251469afed457b38b7028/689266782aad5ecba3a6bd3b_image%20(5).png', price: 8900,  oldPrice: 9500,  rating: 4.5 },
  { slug: 'adidas-street-runner',   name: { fr: 'Sneaker Adidas Street',       ar: 'سنيكر أديداس ستريت' },    brand: 'Adidas',      image: adidasStreetImg, price: 17500, oldPrice: 19000, rating: 4.2 },
  { slug: 'reebok-sport',           name: { fr: 'Chaussure sport Reebok',      ar: 'حذاء رياضي ريبوك' },       brand: 'Reebok',      image: 'https://cdn.prod.website-files.com/689251469afed457b38b7028/689262f1a93361c871877453_image%20(3).png', price: 11000, oldPrice: 12500, rating: 4.3 },
  { slug: 'nike-boot',              name: { fr: 'Boot Nike Outdoor',           ar: 'بوت نايك أوتدور' },        brand: 'Nike',        image: 'https://cdn.prod.website-files.com/689251469afed457b38b7028/68926242b7c4f1a30b7667bf_image%20(2).png', price: 21500, oldPrice: 24000, rating: 4.2 },
  { slug: 'asics-trail',            name: { fr: 'Chaussure trail Asics',       ar: 'حذاء تريل أسيكس' },        brand: 'Asics',       image: 'https://cdn.prod.website-files.com/689251469afed457b38b7028/6892617fb57614fecfd4463c_image%20(1).png', price: 14200, oldPrice: 16000, rating: 4.6 },
  { slug: 'new-balance-runner',     name: { fr: 'Sneaker New Balance',         ar: 'سنيكر نيو بالانس' },       brand: 'New Balance', image: 'https://cdn.prod.website-files.com/689251469afed457b38b7028/6892607b7cd6a58d010644a0_image.png',        price: 15800, oldPrice: 16500, rating: 4.3 },
];

export const articles = [
  {
    slug: 'budget-travel-exploring-the-world-affordably',
    title: 'Budget Travel: Exploring the World Affordably',
    image: 'https://cdn.prod.website-files.com/689251469afed457b38b7028/68936f69d26c6e5db9cc1769_image%20(21).png',
    category: 'Entertainment',
    date: 'April 20, 2025'
  },
  {
    slug: 'improving-sleep-hygiene-for-better-rest',
    title: 'Improving Sleep Hygiene for Better Rest',
    image: 'https://cdn.prod.website-files.com/689251469afed457b38b7028/68aadb260f8df4cb22ccfd94_image.png',
    category: 'Technology',
    date: 'May 1, 2025'
  },
  {
    slug: 'top-10-rendering-software',
    title: 'Top 10 Rendering Software for Stunning Visuals',
    image: 'https://cdn.prod.website-files.com/689251469afed457b38b7028/68936ff678d0bc75fa61f4b1_image%20(23).png',
    category: 'Social Issues',
    date: 'June 12, 2025'
  },
  {
    slug: '10-must-have-wardrobe-staples',
    title: '10 must-have wardrobe staples every fashion Lover',
    image: 'https://cdn.prod.website-files.com/689251469afed457b38b7028/6893702aa38c9ed97b708268_image%20(24).png',
    category: 'Fashion Guide',
    date: 'July 7, 2025'
  }
];

export const categories = [
  { slug: 'running',   name: { fr: 'Running',   ar: 'ركض' },      image: runningImg },
  { slug: 'lifestyle', name: { fr: 'Lifestyle', ar: 'لايف ستايل' }, image: lifestyleImg },
  { slug: 'basket',    name: { fr: 'Basket',    ar: 'كرة السلة' }, image: basketImg },
  { slug: 'football',  name: { fr: 'Football',  ar: 'كرة القدم' }, image: footballImg },
  { slug: 'outdoor',   name: { fr: 'Outdoor',   ar: 'أوتدور' },    image: outdoorImg },
  { slug: 'slides',    name: { fr: 'Slides',    ar: 'شبشب' },       image: slidesImg }
];

export const testimonials = [
  {
    name: 'Harper Jackson',
    image: 'https://cdn.prod.website-files.com/6890fbf29f28b7089b169c21/6893621a929dc19ce2544e67_Ellipse%202.svg',
    productImage: 'https://cdn.prod.website-files.com/6890fbf29f28b7089b169c21/68a1f697d0c6439129efa3a1_d0b5175a471ff8d16ea8c272dcd617a616f365d6.jpg',
    text: '“I’ve never worn shoes this stylish that also feel like walking on clouds. The quality is top-notch, and I get compliments everywhere I go!”'
  },
  {
    name: 'Mason Jack',
    image: 'https://cdn.prod.website-files.com/6890fbf29f28b7089b169c21/68935d2912795d5a43a13801_Ellipse%202%20(1).png',
    productImage: 'https://cdn.prod.website-files.com/6890fbf29f28b7089b169c21/68a1f697a855547004670bcf_263e7fc5d2420ad9299a110f78131c67a0b745b3.jpg',
    text: '“Finding shoes that fit well is always a struggle for me. But here, the sizing guide was spot on and the shoes feel custom-made. Highly recommend!”'
  }
];
