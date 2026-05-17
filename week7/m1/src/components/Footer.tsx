import { Link } from "react-router-dom"

const Footer = () => {
    return (
        <footer className="bg-gray-100 dark:bg-gray-900 py-6 mt-12">
            <div className="container mx-auto text-center text-gray-600 dark:text-gray-400">
                <p>
                    &copy; {new Date().getFullYear()} 돌려돌려LP판 All rights reserved.
                </p>
                <div className="flex justify-center space-x-4 mt-4">
                    <Link to={"#"}>Privacy Policy</Link>
                    <Link to={"#"}>Terms of Service</Link>
                    <Link to={"#"}>Contact</Link>
                </div>
            </div>
        </footer>
    )
}

export default Footer
// Footer 컴포넌트는 사이트의 하단에 위치하는 공통 요소로, 저작권 정보와 함께 개인정보 처리방침, 이용약관, 연락처 등의 링크를 포함합니다. 디자인은 간단하면서도 깔끔하게 유지하여 사용자에게 필요한 정보를 제공하는 역할을 합니다.