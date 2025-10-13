import darkLogo from "@/assets/logos/logo.jpeg";
import logo from "@/assets/logos/logo.jpeg";
import Image from "next/image";

export function Logo() {
  return (
    <div className="relative h-8 max-w-[10.847rem]">
      <Image
        src={logo}
        width={248}
        height={32}
        quality={100}
        className="dark:hidden"
        alt="NextAdmin logo"
        role="presentation"
      />

      <Image
        src={darkLogo}
        fill
        className="hidden dark:block"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />
    </div>
  );
}
