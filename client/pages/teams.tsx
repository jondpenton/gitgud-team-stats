import * as React from 'react';
import { gql } from 'apollo-boost';
import { Query } from 'react-apollo';
import Link from 'next/link';
import Container from '../components/Container';
import Header from '../components/Header';
import { PageProps, IPlayer, ITeam } from '../types';
import Head from 'next/head';
import classnames from 'classnames';
import isPlayerOverSR from '../lib/isPlayerOverSR';
import Table from '../components/Table';

const GET_TEAMS_QUERY = gql`
  query GET_TEAMS_QUERY {
    teams {
      id
      name
      players {
        id
        sr
      }
      slug
      wins
      losses
      ties
      pointDifference
      tieBreakersWon
      setWins
    }
  }
`;

class Teams extends React.Component<PageProps> {
  calculateAverageSR = (players: IPlayer[]): number | null => {
    if (!players) {
      return null;
    }

    const filteredPlayers = players.filter(i => i.sr !== null);
    const total = filteredPlayers.reduce(
      (prev, curr) => prev + (curr.sr as number),
      0,
    );

    if (total === 0) {
      return null;
    }

    return Math.floor(total / filteredPlayers.length);
  };

  render() {
    return (
      <>
        <Head>
          <title>Teams | GitGud Stats</title>
        </Head>
        <Header pathname={this.props.pathname} />
        <Container addMargin>
          <h2>Teams</h2>
          <Query<{ teams: ITeam[] }> query={GET_TEAMS_QUERY}>
            {({ data }) =>
              data ? (
                <Table
                  dashedIndex={7}
                  headers={[
                    'Name',
                    'Average SR',
                    'Record (W-L-T)',
                    'Point Difference',
                  ]}
                  rows={data.teams
                    .filter(team => team.players)
                    .sort((a, b) => {
                      if (!(a.wins || b.wins)) {
                        if (!a.wins) {
                          return 1;
                        } else if (!b.wins) {
                          return -1;
                        }
                      }

                      const wins = (b.wins as number) - (a.wins as number);

                      if (wins !== 0) {
                        return wins;
                      }

                      if (!(a.pointDifference || b.pointDifference)) {
                        if (!a.pointDifference) {
                          return 1;
                        } else if (!b.pointDifference) {
                          return -1;
                        }
                      }

                      const pointDifference =
                        (b.pointDifference as number) -
                        (a.pointDifference as number);

                      if (pointDifference !== 0) {
                        return pointDifference;
                      }

                      if (!(a.tieBreakersWon || b.tieBreakersWon)) {
                        if (!a.tieBreakersWon) {
                          return 1;
                        } else if (!b.tieBreakersWon) {
                          return -1;
                        }
                      }

                      const tieBreakersWon =
                        (b.tieBreakersWon as number) -
                        (a.tieBreakersWon as number);

                      if (tieBreakersWon !== 0) {
                        return tieBreakersWon;
                      }

                      if (!(a.setWins || b.setWins)) {
                        if (!a.setWins) {
                          return 1;
                        } else if (!b.setWins) {
                          return -1;
                        }
                      }

                      const setWins =
                        (b.setWins as number) - (a.setWins as number);

                      if (setWins !== 0) {
                        return setWins;
                      }

                      return a.name.localeCompare(b.name);
                    })
                    .map(team => ({
                      content: [
                        <Link
                          href={{
                            pathname: '/team',
                            query: {
                              slug: team.slug,
                            },
                          }}
                        >
                          <a>{team.name}</a>
                        </Link>,
                        team.players
                          ? this.calculateAverageSR(team.players)
                          : null,
                        `${team.wins}-${team.losses}-${team.ties}`,
                        team.pointDifference,
                      ],
                      red: !!(
                        team.players &&
                        team.players.filter(player => isPlayerOverSR(player))
                          .length !== 0
                      ),
                      yellow: !!(
                        team.players &&
                        team.players.filter(player => !player.sr).length !== 0
                      ),
                    }))}
                />
              ) : null
            }
          </Query>
        </Container>
      </>
    );
  }
}

export default Teams;
