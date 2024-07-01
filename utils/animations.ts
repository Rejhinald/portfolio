import gsap from "gsap";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const animatePageIn = () => {
    const bannerOne = document.getElementById("banner-1");
    const bannerTwo = document.getElementById("banner-2");
    const bannerThree = document.getElementById("banner-3");
    const bannerFour = document.getElementById("banner-4");

    if (bannerOne && bannerTwo && bannerThree && bannerFour) {
        const tl = gsap.timeline();

        tl.set([bannerOne, bannerTwo, bannerThree, bannerFour], {
            yPercent: 0,
            backgroundColor: "rgb(18, 32, 47)", // Update to match your palette
        }).to([bannerOne, bannerTwo, bannerThree, bannerFour], {
            yPercent: 100,
            stagger: 0.2,
            backgroundColor: "rgb(15, 23, 42)", // Update to match bg-slate-950
        });
    }
};

export const animatePageOut = (href: string, router: any[] | AppRouterInstance) => {
    const bannerOne = document.getElementById("banner-1");
    const bannerTwo = document.getElementById("banner-2");
    const bannerThree = document.getElementById("banner-3");
    const bannerFour = document.getElementById("banner-4");

    if (bannerOne && bannerTwo && bannerThree && bannerFour) {
        const tl = gsap.timeline();

        tl.set([bannerOne, bannerTwo, bannerThree, bannerFour], {
            yPercent: -100,
            backgroundColor: "rgb(0, 111, 184)", // Update to match your palette
        }).to([bannerOne, bannerTwo, bannerThree, bannerFour], {
            yPercent: 0,
            stagger: 0.2,
            backgroundColor: "rgb(18, 32, 47)", // Update to match your palette
            onComplete: () => {
                router.push(href);
            },
        });
    }
};
