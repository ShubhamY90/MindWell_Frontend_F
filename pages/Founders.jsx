import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Github, Mail } from 'lucide-react';

const founders = [
    {
        id: 'cf1',
        name: 'Aditya Chouksey',
        role: 'Co-Founder',
        desc: 'MTech, Netaji Subhas University of Technology',
        img: '/cf1Aditya.jpeg',
        gradient: 'from-blue-500/20 to-purple-500/20',
    },
    {
        id: 'cf2',
        name: 'Shubham Yadav',
        role: 'Co-Founder',
        desc: 'BTech, Netaji Subhas University of Technology',
        img: '/cf2Shubham.jpeg',
        gradient: 'from-purple-500/20 to-pink-500/20',
    },
    {
        id: 'cf3',
        name: 'Abhishek Kumar Roy',
        role: 'Co-Founder',
        desc: 'BTech, Netaji Subhas University of Technology',
        img: '/cf3Abhishek.jpeg',
        gradient: 'from-emerald-500/20 to-teal-500/20',
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

const Founders = () => {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F9FBFF] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-3xl mix-blend-multiply opacity-50 animate-blob" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-3xl mix-blend-multiply opacity-50 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-pink-100/50 blur-3xl mix-blend-multiply opacity-50 animate-blob animation-delay-4000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16 z-10"
            >
                <h1 className="text-5xl md:text-6xl font-black text-[#2D3142] tracking-tight mb-4">
                    Meet the Minds Behind <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Vaam</span>
                </h1>
                <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto px-4">
                    United by a vision to make premium mental wellness accessible to everyone.
                </p>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col md:flex-row gap-8 md:gap-12 z-10 px-4 w-full max-w-7xl justify-center items-center"
            >
                {founders.map((founder) => (
                    <motion.div
                        key={founder.id}
                        variants={itemVariants}
                        className="group relative w-full md:w-1/3 flex flex-col items-center"
                    >
                        <div className="relative w-48 h-48 md:w-64 md:h-64 mb-6 rounded-[2rem] p-2 bg-white shadow-xl transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl">
                            <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${founder.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            <div className="w-full h-full relative rounded-3xl overflow-hidden border-2 border-transparent group-hover:border-white/50 transition-all duration-500">
                                <img
                                    src={founder.img}
                                    alt={founder.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                                    <a href="#" className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors duration-300">
                                        <Linkedin size={20} />
                                    </a>
                                    <a href="#" className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors duration-300">
                                        <Github size={20} />
                                    </a>
                                    <a href="#" className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors duration-300">
                                        <Mail size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="text-center px-4 transition-transform duration-500 group-hover:-translate-y-2">
                            <h3 className="text-2xl font-bold text-[#2D3142] mb-1">{founder.name}</h3>
                            <p className="text-sm font-bold tracking-widest text-[#7C9885] uppercase mb-3">{founder.role}</p>
                            <p className="text-gray-500 font-medium leading-relaxed">{founder.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default Founders;
