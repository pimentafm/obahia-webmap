import styled from 'styled-components';

interface ContainerProps {
  ishidden: number;
}

export const Container = styled.div<ContainerProps>`
  display: flex;
  flex-direction: column;
  right: 0px;
  background: #fff;

  min-width: 400px;
  width: 30vw;
  position: absolute;
  z-index: 1;

  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.13), 1px 2px 2px rgba(0, 0, 0, 0.1),
    -1px -2px 2px rgba(0, 0, 0, 0.05);

  transform: translateX(${({ ishidden }) => (ishidden ? 40 : 0)}px);
  transition: 0.3s;

  @media screen and (max-width: 3840px) {
      transform: translateX(${({ ishidden }) => (ishidden ? 30 : 0)}vw);
      transition: 0.3s;
  }

  @media screen and (max-width: 1280px){
      transform: translateX(${({ ishidden }) => (ishidden ? 50 : 0)}vh);
      transition: 0.3s;
  }

  @media screen and (max-width: 800px){
      transform: translateX(${({ ishidden }) => (ishidden ? 68 : 0)}vh);
      transition: 0.3s;
  }

  #handleCardplot {
    position: absolute;
    z-index: 1;
    left: 5px;

    transform: translateX(${({ ishidden }) => (ishidden ? -40 : 0)}px);
    transition: 0.3s;

    svg {
      margin-top: 5px;
      border-radius: 2px;
      background: #fff;
      box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.13),
        1px 2px 2px rgba(0, 0, 0, 0.1), -1px -2px 2px rgba(0, 0, 0, 0.05);
    }
  }
`;
