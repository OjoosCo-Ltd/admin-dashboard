/**
 * A coarse land mask for the Analytics page's dotted world map: one string per
 * row, "#" where a dot goes. It is traced from the map in the Analytics Figma's
 * Geographic Distribution card; the Russian Far East, Kamchatka and New Zealand,
 * which that card's side panel covers, were filled in by hand, and Antarctica is
 * left out. Columns are linear in longitude (-180° to 180°); rows follow the
 * Figma map's Mercator-like latitude scale (about 79°N at the top to 56°S), so
 * place pins against the mask, not by converting lat/lon. The last row is empty
 * bottom padding.
 */
export const WORLD_LAND = [
  "                            ############        ###                   ##",
  "                    #      #############         ###                   #",
  "               #           ##############        #            #        ###",
  "                              ###########                   ##      ######      #",
  "      ##     ##     #  #      ##########                   #      #########      ##",
  "     ####    # ###  #          #########                   #   ################ ####",
  "    #####  # #  ###     ####    ########           ###        ###########################",
  "   ################  # # ###     #####           ###########################################",
  "#######################   ###    ###   ###       ###########################################",
  "   ###################     #     ##     #       ##########################################",
  "   ##################    ##      #             ### #####################################",
  "    ##    ############   ####               #   ## # ############################    ##",
  "           ############# #####              #  #### #############################    ##",
  "            ###################             ######################################   #",
  "             ################                ##### ###############################",
  "             ###############               ########   ########################## #",
  "             ###############               ###   ######### ###################   #",
  "              ##############               ######  # ####################### ##",
  "               ############                ##################################",
  "                #####  ###               ####################################",
  "                  ###    #               ####################################",
  "                   ####                  ###################    ###  ####   #",
  "                       #  ## #           #################      ##    ###   #",
  "                         ######           ################            #    #",
  "                         ########              ##########             ## #####",
  "                        ############            ########               ##   #  ####",
  "                         ###########            ########                         #",
  "                          ##########            ######## #                   ### #",
  "                           ########             ####### ##                 ########",
  "                           ######                #####                    ##########",
  "                           ######                #####                    ##########",
  "                           ####                   ##                       #    ####      #",
  "                          ####                                                   ##      ##",
  "                          ###                                                           ##",
  "                          ###",
  "                          ##",
  "                           #",
  "",
];

/** The grid's size in cells. Dot (column c, row r) sits at (c + 0.5, r + 0.5). */
export const WORLD_COLUMNS = 92;
export const WORLD_ROWS = 38;

/** Where each country's marker goes, in grid units: [x, y]. Keyed by CountryShare id. */
export const WORLD_PINS: Record<string, readonly [x: number, y: number]> = {
  gb: [44.25, 12.5],
  de: [48.25, 13.25],
  us: [20.5, 16.5],
};
